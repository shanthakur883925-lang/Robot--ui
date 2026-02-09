const { ROBOTS } = require("./ROBOTS");

// DOM Elements
const selectionScreen = document.getElementById('selection-screen');
const commandScreen = document.getElementById('command-screen');
const robotCards = document.querySelectorAll('.card');
const homeBtn = document.getElementById('home-btn');
const buttonGrid = document.getElementById('button-grid');
const terminalOutput = document.getElementById('terminal-output');
const currentRobotImg = document.getElementById('current-robot-img');
const currentRobotName = document.getElementById('current-robot-name');
const validationOverlay = document.getElementById('validation-overlay');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error');

let activeRobot = null;
let isExecuting = false;

// Event Listeners
robotCards.forEach(card => {
    card.addEventListener('click', () => {
        const robotName = card.dataset.robot;
        initiateRobotSelection(robotName);
    });
});

homeBtn.addEventListener('click', () => {
    if (isExecuting) return; // Prevent leaving if busy
    showScreen('selection-screen');
    terminalOutput.textContent = '';
});

closeErrorBtn.addEventListener('click', () => {
    errorModal.classList.add('hidden');
});

// Functions
function initiateRobotSelection(robotName) {
    activeRobot = ROBOTS[robotName];
    if (!activeRobot) return;

    // Show validation overlay
    validationOverlay.classList.remove('hidden');

    // Clear terminal on new session
    terminalOutput.textContent = '';

    // Simulate validation delay slightly for UX then run script
    setTimeout(() => {
        runValidation(robotName);
    }, 500);
}

function runValidation(robotName) {
    if (window.api) {
        // Run validation script without flags as a "check"
        // The prompt says "Check validation script exists" -> Execute validation script
        // If script runs with exit code 0, we assume pass.
        // We'll treat empty args as validation check based on the dummy script logic I wrote.
        window.api.runScript(activeRobot.script, []);

        isValidating = true;
    } else {
        console.error("API not exposed");
    }
}

let isValidating = false;

// IPC Handling
if (window.api) {
    window.api.onScriptOutput((data) => {
        const term = document.getElementById('terminal-output');
        term.textContent += data;
        term.scrollTop = term.scrollHeight;
    });

    window.api.onScriptSuccess(({ scriptPath, args }) => {
        if (isValidating) {
            // Validation passed
            isValidating = false;
            validationOverlay.classList.add('hidden');
            setupCommandScreen(activeRobot);
            showScreen('command-screen');
        } else {
            // Command passed
            setExecutionState(false);
            const term = document.getElementById('terminal-output');
            term.textContent += '\nCOMMAND COMPLETED SUCCESSFULLY.\n';
            term.scrollTop = term.scrollHeight;
        }
    });

    window.api.onScriptError(({ scriptPath, args, code }) => {
        if (isValidating) {
            isValidating = false;
            validationOverlay.classList.add('hidden');
            showError(`Validation failed for ${activeRobot.script}. Exit code: ${code}`);
        } else {
            setExecutionState(false);
            const term = document.getElementById('terminal-output');
            term.textContent += `\nCOMMAND FAILED WITH EXIT CODE ${code}.\n`;
            term.scrollTop = term.scrollHeight;
        }
    });

    window.api.onScriptFailure((error) => {
        if (isValidating) {
            isValidating = false;
            validationOverlay.classList.add('hidden');
            showError(`Script execution error: ${error}`);
        } else {
            setExecutionState(false);
            const term = document.getElementById('terminal-output');
            term.textContent += `\nINTERNAL ERROR: ${error}\n`;
        }
    });
}

function setupCommandScreen(robotConfig) {
    // Update Header
    // Find the key for the active object or pass name
    const robotName = Object.keys(ROBOTS).find(key => ROBOTS[key] === robotConfig);
    currentRobotName.textContent = robotName;
    currentRobotImg.src = robotConfig.image;

    // Generate Buttons
    buttonGrid.innerHTML = '';
    robotConfig.buttons.forEach(btnConfig => {
        const btn = document.createElement('button');
        btn.className = 'cmd-btn';
        btn.textContent = btnConfig.label; // Label
        btn.onclick = () => executeCommand(btn, btnConfig.flag);
        buttonGrid.appendChild(btn);
    });
}

function executeCommand(btnElement, flag) {
    if (isExecuting) return;

    setExecutionState(true, btnElement);

    const term = document.getElementById('terminal-output');
    term.textContent += `\n> Executing ${activeRobot.script} with flag ${flag}...\n`;

    window.api.runScript(activeRobot.script, [flag]);
}

function setExecutionState(busy, activeBtn = null) {
    isExecuting = busy;
    const buttons = document.querySelectorAll('.cmd-btn');
    const home = document.getElementById('home-btn');

    buttons.forEach(b => {
        if (busy) {
            b.disabled = true;
            if (b === activeBtn) {
                b.classList.add('executing');
                b.disabled = false; // Keep it "active" visually but maybe ignore clicks
                // Actually request says "Disable other buttons while command runs"
                // And button color changes to Red.
            }
        } else {
            b.disabled = false;
            b.classList.remove('executing');
        }
    });

    home.disabled = busy;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorModal.classList.remove('hidden');
}
