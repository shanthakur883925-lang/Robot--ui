#!/usr/bin/env python3
"""
Robot Teleop Controller - PySide6 Application

This script provides a simple UI with:
- Teleop Robot button (asks for robot number, runs xvalidation.sh -N <robot_number>)
- Stop button (terminates the running teleop process)
- Output log box (shows live stdout/stderr from the script)

Requirements:
    pip install PySide6

Usage:
    python3 teleop_controller.py
"""

import sys
import os
import signal
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QTextEdit, QInputDialog, QLabel, QFrame
)
from PySide6.QtCore import QProcess, Qt
from PySide6.QtGui import QFont, QTextCursor

# ============================================================================
# CONFIGURATION
# ============================================================================
SCRIPT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts")
SCRIPT_NAME = "xvalidation.sh"


class TeleopController(QMainWindow):
    """
    Main window for the Teleop Controller.
    
    Features:
    - Teleop Robot button: Prompts for robot number, executes script with -N flag
    - Stop button: Terminates the running teleop process
    - Output log: Shows live stdout/stderr from the script
    """
    
    def __init__(self):
        super().__init__()
        self.process = None  # QProcess instance for the running script
        self.teleop_running = False
        self.init_ui()
    
    def init_ui(self):
        """Initialize the user interface."""
        self.setWindowTitle("Robot Teleop Controller")
        self.setMinimumSize(800, 600)
        
        # Dark theme styling
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1a1a2e;
            }
            QWidget {
                color: #eaeaea;
                font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            }
            QPushButton {
                background-color: #16213e;
                border: 2px solid #0f3460;
                border-radius: 10px;
                padding: 15px 30px;
                font-size: 16px;
                font-weight: bold;
                color: #00ff88;
            }
            QPushButton:hover {
                background-color: #0f3460;
                border-color: #00ff88;
            }
            QPushButton:pressed {
                background-color: #0a1628;
            }
            QPushButton:disabled {
                background-color: #2a2a3e;
                color: #555;
                border-color: #333;
            }
            QPushButton#teleop_btn {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #16213e, stop:1 #0f3460);
                color: #00ff88;
            }
            QPushButton#stop_btn {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #3d1a1a, stop:1 #5a2a2a);
                border-color: #e94560;
                color: #ff6b6b;
            }
            QPushButton#stop_btn:hover {
                background-color: #5a2a2a;
                border-color: #ff6b6b;
            }
            QPushButton#clear_btn {
                padding: 8px 16px;
                font-size: 12px;
            }
            QTextEdit {
                background-color: #0f0f1a;
                border: 2px solid #0f3460;
                border-radius: 10px;
                padding: 15px;
                font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
                font-size: 13px;
                color: #00ff88;
            }
            QLabel#title {
                font-size: 28px;
                font-weight: bold;
                color: #e94560;
                padding: 15px;
            }
            QLabel#status {
                font-size: 14px;
                color: #888;
                padding: 5px 15px;
            }
            QFrame#separator {
                background-color: #0f3460;
            }
        """)
        
        # Central widget and main layout
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setSpacing(15)
        layout.setContentsMargins(25, 25, 25, 25)
        
        # Title
        title = QLabel("🤖 Robot Teleop Controller")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)
        
        # Separator
        separator = QFrame()
        separator.setObjectName("separator")
        separator.setFixedHeight(2)
        layout.addWidget(separator)
        
        # Buttons row
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(20)
        
        # Teleop Robot Button
        self.btn_teleop = QPushButton("🕹  Teleop Robot")
        self.btn_teleop.setObjectName("teleop_btn")
        self.btn_teleop.setMinimumHeight(60)
        self.btn_teleop.setCursor(Qt.PointingHandCursor)
        self.btn_teleop.clicked.connect(self.on_teleop_clicked)
        btn_layout.addWidget(self.btn_teleop)
        
        # Stop Button
        self.btn_stop = QPushButton("⏹  Stop")
        self.btn_stop.setObjectName("stop_btn")
        self.btn_stop.setMinimumHeight(60)
        self.btn_stop.setCursor(Qt.PointingHandCursor)
        self.btn_stop.setEnabled(False)
        self.btn_stop.clicked.connect(self.on_stop_clicked)
        btn_layout.addWidget(self.btn_stop)
        
        layout.addLayout(btn_layout)
        
        # Status label
        self.status_label = QLabel("Status: Ready")
        self.status_label.setObjectName("status")
        layout.addWidget(self.status_label)
        
        # Terminal header with clear button
        terminal_header = QHBoxLayout()
        terminal_title = QLabel("📺 Live Output")
        terminal_title.setStyleSheet("font-size: 16px; font-weight: bold; color: #aaa;")
        terminal_header.addWidget(terminal_title)
        terminal_header.addStretch()
        
        self.btn_clear = QPushButton("🗑 Clear")
        self.btn_clear.setObjectName("clear_btn")
        self.btn_clear.clicked.connect(self.clear_output)
        terminal_header.addWidget(self.btn_clear)
        layout.addLayout(terminal_header)
        
        # Output log box
        self.output_log = QTextEdit()
        self.output_log.setReadOnly(True)
        self.output_log.setPlaceholderText("Output will appear here when you run Teleop...")
        layout.addWidget(self.output_log)
    
    def log(self, text: str):
        """Append text to the output log and auto-scroll to bottom."""
        cursor = self.output_log.textCursor()
        cursor.movePosition(QTextCursor.End)
        cursor.insertText(text)
        self.output_log.setTextCursor(cursor)
        self.output_log.ensureCursorVisible()
    
    def clear_output(self):
        """Clear the output log."""
        self.output_log.clear()
    
    def on_teleop_clicked(self):
        """
        Handle Teleop Robot button click.
        
        1. Ask for robot number using input dialog
        2. If cancelled or empty -> show "Teleop cancelled" and return
        3. Execute: ./xvalidation.sh -N <robot_number>
        4. Show live output in the log box
        """
        # Step 1: Ask for robot number
        robot_number, ok = QInputDialog.getText(
            self,
            "Enter Robot Number",
            "Enter Robot Number:",
            text=""
        )
        
        # Step 5: If cancelled or empty, do NOT run script
        if not ok or not robot_number.strip():
            self.log("Teleop cancelled\n")
            self.status_label.setText("Status: Teleop cancelled")
            return
        
        robot_number = robot_number.strip()
        
        # Validate robot number is numeric
        if not robot_number.isdigit():
            self.log("ERROR: Robot number must be numeric.\n")
            self.status_label.setText("Status: Invalid robot number")
            return
        
        # Build script path
        script_path = os.path.join(SCRIPT_DIR, SCRIPT_NAME)
        
        if not os.path.exists(script_path):
            self.log(f"ERROR: Script not found at:\n{script_path}\n")
            self.status_label.setText("Status: Script not found")
            return
        
        # Update UI state
        self.teleop_running = True
        self.btn_teleop.setEnabled(False)
        self.btn_stop.setEnabled(True)
        self.status_label.setText(f"Status: Running teleop for robot {robot_number}...")
        
        # Log the command being executed
        self.log("=" * 60 + "\n")
        self.log(f"> Executing: {script_path} -N {robot_number}\n")
        self.log("=" * 60 + "\n")
        
        # Create and configure QProcess
        self.process = QProcess(self)
        self.process.setProcessChannelMode(QProcess.MergedChannels)
        
        # Connect signals for live output
        self.process.readyReadStandardOutput.connect(self.handle_stdout)
        self.process.readyReadStandardError.connect(self.handle_stderr)
        self.process.finished.connect(self.handle_finished)
        self.process.errorOccurred.connect(self.handle_error)
        
        # Step 2 & 3: Execute with -N flag FIRST, then robot number
        self.process.start("bash", [script_path, "-N", robot_number])
    
    def handle_stdout(self):
        """Handle stdout data from the process (Step 4: show output in UI)."""
        if self.process:
            data = self.process.readAllStandardOutput().data()
            text = data.decode('utf-8', errors='replace')
            self.log(text)
    
    def handle_stderr(self):
        """Handle stderr data from the process (Step 4: show output in UI)."""
        if self.process:
            data = self.process.readAllStandardError().data()
            text = data.decode('utf-8', errors='replace')
            self.log(f"[ERR] {text}")
    
    def handle_finished(self, exit_code, exit_status):
        """Handle process completion."""
        self.btn_teleop.setEnabled(True)
        self.btn_stop.setEnabled(False)
        self.teleop_running = False
        
        self.log("\n" + "=" * 60 + "\n")
        if exit_code == 0:
            self.log("> Process completed successfully.\n")
            self.status_label.setText("Status: Completed successfully")
        elif exit_code == -1 or exit_code == 15:
            # Process was terminated by Stop button
            pass  # Message already shown in on_stop_clicked
        else:
            self.log(f"> Process exited with code {exit_code}\n")
            self.status_label.setText(f"Status: Exited with code {exit_code}")
        self.log("=" * 60 + "\n")
        
        self.process = None
    
    def handle_error(self, error):
        """Handle process errors."""
        error_messages = {
            QProcess.FailedToStart: "Failed to start the process",
            QProcess.Crashed: "Process crashed",
            QProcess.Timedout: "Process timed out",
            QProcess.WriteError: "Write error",
            QProcess.ReadError: "Read error",
            QProcess.UnknownError: "Unknown error"
        }
        msg = error_messages.get(error, "Unknown error")
        self.log(f"\nERROR: {msg}\n")
        self.status_label.setText(f"Status: Error - {msg}")
    
    def on_stop_clicked(self):
        """
        Handle Stop button click (Steps 6 & 7).
        
        6. Terminate ONLY the teleop process started by Teleop button
        7. Show "Teleop stopped by user" in the output box
        """
        if self.process and self.teleop_running:
            self.log("\n" + "=" * 60 + "\n")
            self.log("Teleop stopped by user\n")
            self.log("=" * 60 + "\n")
            self.status_label.setText("Status: Teleop stopped by user")
            
            # Terminate the process
            self.process.terminate()
            
            # Give it 2 seconds to terminate gracefully
            if not self.process.waitForFinished(2000):
                # Force kill if it doesn't respond
                self.process.kill()
                self.process.waitForFinished(1000)
            
            self.btn_teleop.setEnabled(True)
            self.btn_stop.setEnabled(False)
            self.teleop_running = False
    
    def closeEvent(self, event):
        """Handle window close - cleanup running processes."""
        if self.process and self.process.state() == QProcess.Running:
            self.process.terminate()
            self.process.waitForFinished(2000)
            if self.process.state() == QProcess.Running:
                self.process.kill()
        event.accept()


def main():
    """Application entry point."""
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    window = TeleopController()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
