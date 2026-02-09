#!/bin/bash

# Define environment name
VENV_NAME="venv"

echo "Setting up Virtual Environment: $VENV_NAME..."

# Check if python3-venv is installed (Debian/Ubuntu specific check)
dpkg -s python3-venv &> /dev/null
if [ $? -ne 0 ]; then
    echo "Warning: 'python3-venv' might not be installed."
    echo "If the next step fails, try running: sudo apt install python3-venv"
fi

# Create venv
python3 -m venv $VENV_NAME

# Activate
if [ -f "$VENV_NAME/bin/activate" ]; then
    source $VENV_NAME/bin/activate
    echo "Virtual environment created and activated."
    
    # Install requirements
    if [ -f "requirements.txt" ]; then
        echo "Installing dependencies from requirements.txt..."
        pip install -r requirements.txt
    else
        echo "Installing default dependencies..."
        pip install fastapi uvicorn websockets httpx ptyprocess
    fi

    echo ""
    echo "Setup Complete! To use it, run:"
    echo "  source $VENV_NAME/bin/activate"
    echo "  python3 main.py"
else
    echo "Failed to create virtual environment."
    echo "Fallback: Installing dependencies to user space..."
    pip install --user -r requirements.txt
fi
