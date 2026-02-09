# Professional Robot UI

A modern, industrial-styled web interface for controlling the Zippy Robot system.
This project replaces the legacy `robotControl.sh` script with a full GUI featuring live terminal integration.

## 📂 Folder Structure

```
robot_ui/
├── backend/            # Python FastAPI Backend
│   ├── main.py         # API Server & Terminal WebSocket Logic
│   └── venv/           # Python Virtual Environment
├── frontend/           # React + Vite Frontend
│   ├── src/
│   │   ├── components/ # UI Components (Terminal, Controls)
│   │   ├── App.jsx     # Main Layout
│   │   └── index.css   # Industrial Dark Theme Styles
│   └── package.json
└── scripts/            # Helper scripts (if any)
```

## 🚀 How to Run

### Prerequisite
Make sure you have `python3`, `pip`, and `npm` installed.

### 1. Start the Backend
The backend handles the robot command proxy and the live terminal.

```bash
cd backend
# Install dependencies (if not already done)
pip install --user fastapi uvicorn websockets httpx ptyprocess

# Run the server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Frontend
The frontend is the visual dashboard.

```bash
cd frontend
# Install dependencies (if not already done)
npm install

# Run the dev server
npm run dev
```

OPEN your browser at `http://localhost:5173` (or the URL shown in terminal).

## 🛠 Adding New Commands

To add a new command (e.g., "RESET"):

1.  **Backend (`backend/main.py`)**:
    Add the new action to the `RobotAction` Enum:
    ```python
    class RobotAction(str, Enum):
        ...
        RESET = "reset"
    ```
    (Ensure the robot server at port 7012 supports `/robot/reset`, or add logic in `control_robot` to handle it).

2.  **Frontend (`frontend/src/components/RobotControls.jsx`)**:
    Add a new button in the grid:
    ```jsx
    <button className="btn" onClick={() => handleAction('reset')}>
        RESET
    </button>
    ```

## 🖥 Live Terminal
The terminal in the UI is a real bash shell running on the server. You can use it to execute manual commands like `ping`, `ls`, or run other scripts just like in `robotControl.sh` loop mode.
