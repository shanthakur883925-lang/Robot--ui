from typing import List, Dict
from pydantic import BaseModel

class RobotCommand(BaseModel):
    label: str
    command_args: List[str]

class RobotConfig(BaseModel):
    id: str
    name: str
    image_key: str  # For frontend mapping
    validation_script: List[str]
    commands: List[RobotCommand]

# Configuration for the 4 robot types
# Using dummy scripts for now
SCRIPTS_DIR = "/home/vlabuser2/.gemini/antigravity/scratch/robot_ui/scripts"

ROBOTS: Dict[str, RobotConfig] = {
    "zippy6": RobotConfig(
        id="zippy6",
        name="Zippy6",
        image_key="zippy6",
        validation_script=[f"{SCRIPTS_DIR}/validate_robot.sh", "Zippy6"],
        commands=[
            RobotCommand(label="Home System", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Home_Zippy6", "3"]),
            RobotCommand(label="Calibrate Axis", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Calibrate_Zippy6", "5"]),
            RobotCommand(label="Log Data", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Log_Zippy6", "2"]),
        ]
    ),
    "zippy10": RobotConfig(
        id="zippy10",
        name="Zippy10",
        image_key="zippy10",
        validation_script=[f"{SCRIPTS_DIR}/validate_robot.sh", "Zippy10"],
        commands=[
            RobotCommand(label="Quick Scan", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Scan_Zippy10", "4"]),
            RobotCommand(label="Deep Clean", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Clean_Zippy10", "6"]),
        ]
    ),
    "zippy40": RobotConfig(
        id="zippy40",
        name="Zippy40",
        image_key="zippy40",
        validation_script=[f"{SCRIPTS_DIR}/validate_robot.sh", "Zippy40"],
        commands=[
            RobotCommand(label="Heavy Lift", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Lift_Zippy40", "8"]),
            RobotCommand(label="Safety Check", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Safety_Zippy40", "2"]),
            RobotCommand(label="Diagnose", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Diag_Zippy40", "5"]),
        ]
    ),
    "zippyx": RobotConfig(
        id="zippyx",
        name="ZippyX",
        image_key="zippyx",
        validation_script=[f"{SCRIPTS_DIR}/validate_robot.sh", "ZippyX"],
        commands=[
            RobotCommand(label="Expert Mode", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Expert_ZippyX", "10"]),
            RobotCommand(label="Update Firmware", command_args=[f"{SCRIPTS_DIR}/run_command.sh", "Update_ZippyX", "15"]),
        ]
    ),
}
