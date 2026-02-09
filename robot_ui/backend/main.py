import os
import pty
import subprocess
import select
import termios
import struct
import fcntl
import asyncio
import logging
import shlex
from typing import List, Optional, Dict

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from robots_config import ROBOTS, RobotCommand

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("robot_ui_backend")

app = FastAPI(title="Robot UI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to manage the "Terminal" process
# In a real app with multiple users, this needs to be more robust (session based).
# For this single-user desktop app, a global is acceptable.
active_process: Optional[subprocess.Popen] = None
master_fd: Optional[int] = None

class ValidationResponse(BaseModel):
    success: bool
    message: str

class CommandRequest(BaseModel):
    robot_id: str
    command_index: int

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/robots")
async def get_robots():
    """List available robots."""
    return [
        {
            "id": r.id, 
            "name": r.name, 
            "image_key": r.image_key
        } 
        for r in ROBOTS.values()
    ]

@app.get("/api/robots/{robot_id}/commands")
async def get_robot_commands(robot_id: str):
    if robot_id not in ROBOTS:
        raise HTTPException(404, "Robot not found")
    
    return ROBOTS[robot_id].commands

@app.post("/api/robots/{robot_id}/validate")
async def validate_robot(robot_id: str):
    if robot_id not in ROBOTS:
        raise HTTPException(404, "Robot not found")
    
    config = ROBOTS[robot_id]
    
    # Run validation synchronously for simplicity, but in a real app should be async/background
    # Note: subprocess.run blocks.
    try:
        result = subprocess.run(
            config.validation_script, 
            capture_output=True, 
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            return {"success": True, "message": result.stdout}
        else:
             return {"success": False, "message": f"Validation failed:\n{result.stderr}\n{result.stdout}"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/execute")
async def execute_command(req: CommandRequest):
    global active_process, master_fd
    
    if req.robot_id not in ROBOTS:
        raise HTTPException(404, "Robot not found")
    
    robot = ROBOTS[req.robot_id]
    
    if req.command_index < 0 or req.command_index >= len(robot.commands):
        raise HTTPException(400, "Invalid command index")
        
    cmd_config = robot.commands[req.command_index]
    
    # Kill existing if any
    if active_process and active_process.poll() is None:
        try:
            active_process.terminate()
            if master_fd:
                os.close(master_fd)
                master_fd = None
        except:
            pass
            
    # Start new process wrapped in PTY
    master_fd, slave_fd = pty.openpty()
    
    env = os.environ.copy()
    env["TERM"] = "xterm-256color"
    
    try:
        active_process = subprocess.Popen(
            cmd_config.command_args,
            preexec_fn=os.setsid,
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            env=env,
            start_new_session=True
        )
        os.close(slave_fd)
        return {"status": "started", "command": cmd_config.label}
    except Exception as e:
        if master_fd:
             os.close(master_fd)
        raise HTTPException(500, f"Failed to start command: {e}")

@app.websocket("/ws/terminal")
async def terminal_websocket(websocket: WebSocket):
    await websocket.accept()
    global master_fd, active_process
    
    loop = asyncio.get_running_loop()
    
    try:
        while True:
            if master_fd is None:
                # No active command, just wait a bit or echo
                # In a real shell app we would spawn a bash shell here if nothing is running,
                # but for this specific requirement, we only show command output.
                # Use a small sleep to avoid busy loop
                await asyncio.sleep(0.1)
                continue
                
            # Helper to read PTY
            def read_pty():
                if master_fd is None: return b""
                try:
                    return os.read(master_fd, 1024)
                except OSError:
                    return b""

            # Create tasks
            pty_task = loop.run_in_executor(None, read_pty)
            ws_task = websocket.receive_text()
            
            done, pending = await asyncio.wait(
                [pty_task, ws_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            for task in done:
                if task == pty_task:
                    data = task.result()
                    if data:
                        await websocket.send_text(data.decode("utf-8", errors="ignore"))
                    else:
                        # Process might be done or closed, perform check
                        if active_process and active_process.poll() is not None:
                             # Process finished
                             await websocket.send_text("\n[Command Finished]\n")
                             master_fd = None # invalid descriptor
                
                elif task == ws_task:
                    msg = task.result()
                    if master_fd:
                         os.write(master_fd, msg.encode("utf-8"))

    except WebSocketDisconnect:
        logger.info("Websocket disconnected")
    except Exception as e:
        logger.error(f"Terminal error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
