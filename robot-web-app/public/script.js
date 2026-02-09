const socket = io();

// State
let selectedRobot = null;
let isExecuting = false;

// Teleop Terminal State
let teleopTerminal = null;
let teleopFitAddon = null;
let isTeleopActive = false;

// DOM Elements
const selectionScreen = document.getElementById('selection-screen');
const commandScreen = document.getElementById('command-screen');
// Update Status UI Elements
function updateStatusUI(status) {
    const onlineDiv = document.getElementById('status-online');
    const onlineText = document.getElementById('status-online-text');
    const pingText = document.getElementById('status-ping-text');
    const batteryText = document.getElementById('status-battery-text');
    const modeText = document.getElementById('status-mode-text');
    const overviewBattery = document.getElementById('overview-battery');

    // Update Online Status
    if (status.online) {
        onlineDiv.style.color = '#4ade80';
        onlineDiv.style.borderColor = '#22c55e';
        onlineText.textContent = 'ONLINE';
    } else {
        onlineDiv.style.color = '#ef4444';
        onlineDiv.style.borderColor = '#dc2626';
        onlineText.textContent = 'OFFLINE';
    }

    // Update Ping
    pingText.textContent = status.ping || '—';

    // Update Battery (both places)
    batteryText.textContent = status.battery || '0%';
    if (overviewBattery) {
        overviewBattery.textContent = status.battery || '0%';
        // Change color based on connection
        if (status.online && status.battery !== '0%') {
            overviewBattery.style.color = '#4ade80'; // Green when connected
        } else {
            overviewBattery.style.color = '#64748b'; // Gray when disconnected
        }
    }

    // Update Mode
    modeText.textContent = status.mode || '—';
}
const robotNumberInput = document.getElementById('robot-number');
const buttonsContainer = document.getElementById('buttons-container');
const terminalOutput = document.getElementById('terminal-output');
const headerTitle = document.getElementById('header-title');
const headerImg = document.getElementById('header-img');

// Robot Configuration
const ROBOTS = {
    'ZippyX': {
        name: 'ZippyX',
        image: 'assets/zippyx.png',
        buttons: [
            { flag: '-s', label: 'SSH' },
            { flag: '-i', label: 'Inspect Docker' },
            { flag: '-u', label: 'Update Registry' },
            { flag: '-v', label: 'Update FW' },
            { flag: '-o', label: 'Linear Odom' },
            { flag: '-h', label: 'Hostname' },
            { flag: '-L', label: 'Latest Bags' },
            { flag: '-M', label: 'Check Bags' },
            { flag: '-T', label: 'Check PGV' },
            { flag: '-D', label: 'Download Bag' },
            { flag: '-X', label: 'Reboot' },
            { flag: '-d', label: 'Debug Detail' },
            { flag: '-c', label: 'Client Debug' },
            { flag: '-m', label: 'Topic Monitor' },
            { flag: '-B', label: 'Barcode Data' },
            { flag: '-E', label: 'Error Codes' },
            { flag: '-A', label: 'Lifter Debug' },
            { flag: '-G', label: 'Goal Result' },
            { flag: '-O', label: 'Raw Odom' }
        ]
    },
    'Zippy40': {
        name: 'Zippy40',
        image: 'assets/zippy40.png',
        buttons: [
            { flag: '-s', label: 'SSH' },
            { flag: '-i', label: 'Inspect Docker' },
            { flag: '-x', label: 'Restart Docker' },
            { flag: '-u', label: 'Update Registry' },
            { flag: '-v', label: 'Update FW' },
            { flag: '-o', label: 'Linear Odom' },
            { flag: '-h', label: 'Hostname' },
            { flag: '-p', label: 'Update Params' },
            { flag: '-D', label: 'Download Bag' },
            { flag: '-X', label: 'Reboot' },
            { flag: '-d', label: 'Debug Detail' },
            { flag: '-c', label: 'Client Debug' },
            { flag: '-m', label: 'Topic Monitor' },
            { flag: '-B', label: 'Barcode Data' },
            { flag: '-E', label: 'Error Codes' },
            { flag: '-A', label: 'Lifter Debug' },
            { flag: '-G', label: 'Goal Result' },
            { flag: '-O', label: 'Raw Odom' }
        ]
    },
    'Forklift': {
        name: 'Forklift',
        image: 'assets/forklift.png',
        buttons: [
            { flag: '-s', label: 'SSH' },
            { flag: '-i', label: 'Inspect Docker' },
            { flag: '-x', label: 'Restart Docker' },
            { flag: '-u', label: 'Update Registry' },
            { flag: '-v', label: 'Update FW' },
            { flag: '-o', label: 'Linear Odom' },
            { flag: '-h', label: 'Hostname' },
            { flag: '-p', label: 'Update Params' },
            { flag: '-D', label: 'Download Bag' },
            { flag: '-X', label: 'Reboot' },
            { flag: '-d', label: 'Debug Detail' },
            { flag: '-c', label: 'Client Debug' },
            { flag: '-m', label: 'Topic Monitor' },
            { flag: '-B', label: 'Barcode Data' },
            { flag: '-E', label: 'Error Codes' },
            { flag: '-A', label: 'Lifter Debug' },
            { flag: '-G', label: 'Goal Result' },
            { flag: '-O', label: 'Raw Odom' }
        ]
    }
};

// Functions
function selectRobot(robotType) {
    selectedRobot = ROBOTS[robotType];

    // Setup Header
    // Note: Top bar title is now generic + Robot Name
    document.getElementById('header-img').src = selectedRobot.image;
    document.getElementById('header-title').textContent = selectedRobot.name;

    // Generate Buttons List
    const listContainer = document.getElementById('command-list-container');
    listContainer.innerHTML = '';

    selectedRobot.buttons.forEach(btn => {
        // Create list item style button
        const item = document.createElement('div');
        item.className = 'cmd-list-item';
        item.onclick = () => runCommand(btn.flag, item);

        // Icon mapping (simple)
        let iconClass = 'fas fa-terminal';
        if (btn.label.includes('SSH')) iconClass = 'fas fa-terminal';
        else if (btn.label.includes('Docker')) iconClass = 'fab fa-docker';
        else if (btn.label.includes('Update')) iconClass = 'fas fa-cloud-upload-alt';
        else if (btn.label.includes('Bag')) iconClass = 'fas fa-file-archive';
        else if (btn.label.includes('Reboot')) iconClass = 'fas fa-power-off';
        else if (btn.label.includes('Debug')) iconClass = 'fas fa-bug';

        item.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${btn.label}</span>
        `;

        listContainer.appendChild(item);
    });

    // Hide/Show Maintenance Mode based on robot type
    const maintenanceCard = document.querySelector('.mode-maintenance');
    if (maintenanceCard) {
        if (robotType === 'Zippy40') {
            // Hide maintenance for Zippy40
            maintenanceCard.style.display = 'none';
        } else {
            // Show maintenance for other robots (ZippyX)
            maintenanceCard.style.display = 'flex';
        }
    }

    // Reset Input
    // robotNumberInput.value = ''; // Keep previous input or default '3' per design

    // Switch Screens
    selectionScreen.classList.remove('active');
    commandScreen.classList.add('active');

    // Check global status and apply to new buttons
    setExecuting(isExecuting);
}

function goHome() {
    commandScreen.classList.remove('active');
    selectionScreen.classList.add('active');
    selectedRobot = null;
    terminalOutput.innerHTML = '';
}

// Auto-scroll state (user can disable it)
let autoScrollEnabled = true;

function clearTerminal() {
    terminalOutput.textContent = '';
}

function toggleAutoScroll() {
    autoScrollEnabled = !autoScrollEnabled;
    const toggleIcon = document.getElementById('auto-scroll-icon');
    const toggleText = document.getElementById('auto-scroll-text');

    if (autoScrollEnabled) {
        toggleIcon.className = 'fas fa-toggle-on';
        toggleIcon.style.color = '#4ade80';
        toggleText.textContent = 'Auto-Scroll: ON';
        // Immediately scroll to bottom when re-enabled
        scrollToBottom(terminalOutput);
    } else {
        toggleIcon.className = 'fas fa-toggle-off';
        toggleIcon.style.color = '#64748b';
        toggleText.textContent = 'Auto-Scroll: OFF';
    }
}

function downloadTerminalLogs() {
    const logs = terminalOutput.textContent;
    if (!logs || logs.trim().length === 0) {
        alert('No logs to download!');
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `robot-terminal-logs-${timestamp}.txt`;

    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function runCommand(flag, btnElement) {
    if (isExecuting) return;

    const robotNum = robotNumberInput.value.trim();
    if (!robotNum) {
        alert('Please enter a Robot Number first!');
        robotNumberInput.focus();
        return;
    }

    if (!/^\d+$/.test(robotNum)) {
        alert('Robot Number must be numeric!');
        return;
    }

    let extraArgs = [];
    if (flag === '-D') {
        const archiveName = prompt('Enter Tar File Name (without .tar):');
        if (archiveName === null) return; // User cancelled
        if (!archiveName.trim()) {
            alert('Archive name is required.');
            return;
        }

        const destPath = prompt('Enter Download Destination Path (e.g., user@ip:/path/):');
        if (destPath === null) return;
        if (!destPath.trim()) {
            alert('Destination path is required.');
            return;
        }

        const count = prompt('Enter Number of Latest Bag Files:');
        if (count === null) return;
        if (!/^\d+$/.test(count.trim())) {
            alert('Bag count must be a number.');
            return;
        }

        extraArgs = [archiveName.trim(), destPath.trim(), count.trim()];
    }

    // Optimistic UI update
    setExecuting(true, btnElement);

    // Send to server
    socket.emit('run-command', {
        robotType: selectedRobot.name,
        robotNumber: robotNum,
        flag: flag,
        extraArgs: extraArgs
    });
}

function stopCommand() {
    if (!isExecuting) return;
    socket.emit('stop-command');
    // UI update will happen on 'status' event from server
}

function setExecuting(busy, activeBtn = null) {
    isExecuting = busy;
    const buttons = document.querySelectorAll('.cmd-btn');
    const stopBtn = document.getElementById('stop-btn');

    // If we are starting execution, mark the active button
    if (busy && activeBtn) {
        activeBtn.classList.add('executing');
    }

    buttons.forEach(b => {
        if (busy) {
            // Disable all buttons. 
            // If it's the executing one, we want it to look active (executing class handles opacity)
            // but effectively disabled for clicks.
            b.disabled = true;
        } else {
            b.disabled = false;
            b.classList.remove('executing');
        }
    });

    if (stopBtn) {
        // Stop button is enabled ONLY when busy
        stopBtn.disabled = !busy;
    }
}

// ============================================
// TERMINAL PERFORMANCE & AUTO-SCROLL LOGIC
// ============================================

// Configuration
const MAX_TERMINAL_LENGTH = 50000;  // Limit total chars to prevent DOM bloat
const BUFFER_INTERVAL = 80;         // Batch updates every 80ms (50-100ms range)

// State
let outputBuffer = '';              // Buffer for incoming data
let flushScheduled = false;         // Prevent multiple flush calls

/**
 * Check if terminal is scrolled to bottom (with tolerance)
 * @param {HTMLElement} element - The scrollable element
 * @param {number} tolerance - Pixels of tolerance (default 50)
 * @returns {boolean} - True if at bottom
 */
function isAtBottom(element, tolerance = 50) {
    if (!element) return true;
    return element.scrollHeight - element.scrollTop <= element.clientHeight + tolerance;
}

/**
 * Scroll element to bottom
 * @param {HTMLElement} element - The scrollable element
 */
function scrollToBottom(element) {
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}

/**
 * Flush buffered output to terminal
 * Called on a schedule to batch updates for performance
 */
function flushTerminalBuffer() {
    // Skip if no data or no terminal
    if (!outputBuffer.length || !terminalOutput) {
        flushScheduled = false;
        return;
    }

    // STEP 1: Check scroll position BEFORE modifying content (using consistent 50px tolerance)
    const wasAtBottom = isAtBottom(terminalOutput, 50);
    const currentScrollTop = terminalOutput.scrollTop;

    // STEP 2: Get buffered content and clear buffer
    const dataToAppend = outputBuffer;
    outputBuffer = '';

    // STEP 3: Append text content (DOM update)
    terminalOutput.textContent += dataToAppend;

    // STEP 4: Truncate if too long (keep latest content)
    if (terminalOutput.textContent.length > MAX_TERMINAL_LENGTH) {
        const oldScrollHeight = terminalOutput.scrollHeight;
        terminalOutput.textContent = terminalOutput.textContent.slice(-MAX_TERMINAL_LENGTH);
        const newScrollHeight = terminalOutput.scrollHeight;

        // Adjust scroll position after truncation if user was scrolled up
        if (!wasAtBottom) {
            const heightDiff = oldScrollHeight - newScrollHeight;
            terminalOutput.scrollTop = Math.max(0, currentScrollTop - heightDiff);
        }
    }

    // STEP 5: Handle scroll position
    if (wasAtBottom && autoScrollEnabled) {
        // User was at bottom AND auto-scroll is enabled → scroll to new bottom
        // Use immediate scroll + requestAnimationFrame for guaranteed reliability
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        requestAnimationFrame(() => {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        });
    }
    // If user had scrolled up OR auto-scroll disabled → do nothing (position already preserved)

    flushScheduled = false;
}

/**
 * Schedule a buffer flush (debounced)
 */
function scheduleFlush() {
    if (!flushScheduled) {
        flushScheduled = true;
        setTimeout(flushTerminalBuffer, BUFFER_INTERVAL);
    }
}

/**
 * Add data to the output buffer
 * @param {string} data - The data to add
 */
function appendToTerminal(data) {
    outputBuffer += data;
    scheduleFlush();
}

// Socket IO Listeners
socket.on('output', (data) => {
    // Buffer the data for batched rendering
    appendToTerminal(data);

    // Also update conveyor terminal if modal is open
    const conveyorModal = document.getElementById('conveyor-modal');
    if (conveyorModal && conveyorModal.style.display === 'flex') {
        const conveyorTerminal = document.getElementById('conveyor-terminal');
        if (conveyorTerminal) {
            // Check if user is at bottom before appending
            const wasAtBottom = isAtBottom(conveyorTerminal, 20);

            // Append directly (conveyor gets less frequent updates)
            conveyorTerminal.textContent += data;

            // Truncate if too long (prevent memory issues)
            if (conveyorTerminal.textContent.length > MAX_TERMINAL_LENGTH) {
                conveyorTerminal.textContent = conveyorTerminal.textContent.slice(-MAX_TERMINAL_LENGTH);
            }

            // Auto-scroll only if user was at bottom
            if (wasAtBottom) {
                requestAnimationFrame(() => scrollToBottom(conveyorTerminal));
            }
        }
    }
});

socket.on('status', (data) => {
    isExecuting = data.isRunning;
    const buttons = document.querySelectorAll('.cmd-btn');
    const stopBtn = document.getElementById('stop-btn');

    if (!isExecuting) {
        // Reset all buttons if execution stops
        document.querySelectorAll('.cmd-btn.executing').forEach(b => b.classList.remove('executing'));
        buttons.forEach(b => b.disabled = false);

        // Reset teleop state
        isTeleopRunning = false;

        if (stopBtn) stopBtn.disabled = true;
    } else {
        // If we joined late and something is running
        buttons.forEach(b => {
            // If we don't know which one is running (refresh case),
            // we just disable all. We can't recover the "red" state for the specific button
            // unless the server tells us WHICH flag is running.
            // For now, just disable all is safe.
            b.disabled = true;
        });

        if (stopBtn) stopBtn.disabled = false;
    }
});

// Alias for manual usage or requirement satisfaction
window.sendCommand = (flag) => {
    // Attempt to find the button that triggered this if possible, or pass null
    // Since we are using onclick="sendCommand('..')", 'this' might not be bound unless passed.
    // We will just pass null, but we can try to look up event.
    const event = window.event;
    const btn = event ? event.target : null;
    runCommand(flag, btn);
};

window.toggleDockerCommands = function () {
    const panel = document.getElementById("dockerCommandsPanel");
    const ctrlPanel = document.getElementById("robotControlPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "grid";
        if (ctrlPanel) ctrlPanel.style.display = "none"; // Close other
        panel.style.opacity = 0;
        setTimeout(() => panel.style.opacity = 1, 10);
    } else {
        panel.style.display = "none";
    }
}

// Robot Control Mode logic
let currentControlMode = 'teleop';

window.toggleRobotControl = function () {
    const panel = document.getElementById("robotControlPanel");
    const dockerPanel = document.getElementById("dockerCommandsPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
        if (dockerPanel) dockerPanel.style.display = "none"; // Close other
        panel.style.opacity = 0;
        setTimeout(() => panel.style.opacity = 1, 10);
    } else {
        panel.style.display = "none";
    }
}

window.setControlMode = function (mode) {
    currentControlMode = mode;
    const badge = document.getElementById("current-mode-badge");
    badge.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

    // Update badge color
    const colors = {
        'teleop': '#10b981',      // Green
        'maintenance': '#f59e0b', // Yellow/Orange
        'conveyor': '#3b82f6'     // Blue
    };
    badge.style.background = colors[mode] || '#10b981';
}

// Teleop state tracking
let isTeleopRunning = false;

// Robot IP mapping (based on robot number)
// Formula: 10.30.72.(robotNumber + 60)
function getRobotIP(robotNum) {
    const ipPrefix = '10.30.72.';
    const offsetIP = 60;
    return ipPrefix + (parseInt(robotNum) + offsetIP);
}

// NEW: Start Teleop function - Opens real terminal with turtlebot3_teleop_key
window.startTeleop = function () {
    // Check if robot is selected
    if (!selectedRobot) {
        alert('Please select a robot first!');
        return;
    }

    // Get robot number from input OR prompt
    let robotNum = robotNumberInput.value.trim();

    if (!robotNum) {
        robotNum = prompt('Enter Robot Number:');
        if (robotNum === null || !robotNum.trim()) {
            terminalOutput.textContent += '\nTeleop cancelled\n';
            scrollToBottom(terminalOutput);
            return;
        }
        robotNum = robotNum.trim();
    }

    // Validate numeric
    if (!/^\d+$/.test(robotNum)) {
        alert('Robot Number must be numeric!');
        return;
    }

    // Fill the input field with the robot number
    robotNumberInput.value = robotNum;

    // Calculate robot IP
    const robotIP = getRobotIP(robotNum);
    const robotPassword = 'zippy';  // Default password

    // Show teleop modal
    const modal = document.getElementById('teleop-modal');
    const teleopRobotId = document.getElementById('teleop-robot-id');
    teleopRobotId.textContent = robotNum;
    modal.style.display = 'flex';

    // Initialize xterm.js terminal
    const termContainer = document.getElementById('teleop-terminal');
    termContainer.innerHTML = ''; // Clear previous

    teleopTerminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        theme: {
            background: '#0d1117',
            foreground: '#c9d1d9',
            cursor: '#10b981',
            selection: 'rgba(16, 185, 129, 0.3)'
        }
    });

    teleopFitAddon = new FitAddon.FitAddon();
    teleopTerminal.loadAddon(teleopFitAddon);
    teleopTerminal.open(termContainer);
    teleopFitAddon.fit();

    // Handle window resize
    window.addEventListener('resize', () => {
        if (teleopFitAddon) teleopFitAddon.fit();
    });

    // Send keyboard input to server
    teleopTerminal.onData((data) => {
        socket.emit('teleop-input', data);
    });

    // Request server to start teleop session
    isTeleopActive = true;
    socket.emit('start-teleop', {
        robotNumber: robotNum,
        robotIP: robotIP,
        robotPassword: robotPassword
    });

    // Focus the terminal so keypresses work
    teleopTerminal.focus();
}

// Stop Teleop and close modal
window.stopTeleop = function () {
    if (isTeleopActive) {
        socket.emit('stop-teleop');
    }
    closeTeleopModal();
}

function closeTeleopModal() {
    const modal = document.getElementById('teleop-modal');
    modal.style.display = 'none';

    if (teleopTerminal) {
        teleopTerminal.dispose();
        teleopTerminal = null;
    }
    teleopFitAddon = null;
    isTeleopActive = false;
}

// Socket listeners for teleop
socket.on('teleop-output', (data) => {
    if (teleopTerminal) {
        teleopTerminal.write(data);
    }
});

socket.on('teleop-stopped', () => {
    isTeleopActive = false;
    // Optionally auto-close modal after a delay
    setTimeout(() => {
        if (!isTeleopActive) {
            // closeTeleopModal(); // Uncomment to auto-close
        }
    }, 2000);
});

// ==========================================
// MAINTENANCE MODE (Lifter Control)
// ==========================================
let maintenanceTerminal = null;
let maintenanceFitAddon = null;
let isMaintenanceActive = false;

// Start Maintenance - Opens real terminal for lifter control
window.startMaintenance = function () {
    // Check if robot is selected
    if (!selectedRobot) {
        alert('Please select a robot first!');
        return;
    }

    // Get robot number from input OR prompt
    let robotNum = robotNumberInput.value.trim();

    if (!robotNum) {
        robotNum = prompt('Enter Robot Number for Maintenance:');
        if (robotNum === null || !robotNum.trim()) {
            terminalOutput.textContent += '\nMaintenance cancelled\n';
            scrollToBottom(terminalOutput);
            return;
        }
        robotNum = robotNum.trim();
    }

    // Validate numeric
    if (!/^\d+$/.test(robotNum)) {
        alert('Robot Number must be numeric!');
        return;
    }

    // Fill the input field with the robot number
    robotNumberInput.value = robotNum;

    // Calculate robot IP
    const robotIP = getRobotIP(robotNum);
    const robotPassword = 'zippy';  // Default password

    // Show maintenance modal
    const modal = document.getElementById('maintenance-modal');
    const maintenanceRobotId = document.getElementById('maintenance-robot-id');
    maintenanceRobotId.textContent = robotNum;
    modal.style.display = 'flex';

    // Initialize xterm.js terminal for maintenance
    const termContainer = document.getElementById('maintenance-terminal');
    termContainer.innerHTML = ''; // Clear previous

    maintenanceTerminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        theme: {
            background: '#0d1117',
            foreground: '#c9d1d9',
            cursor: '#f59e0b',  // Orange cursor
            selection: 'rgba(245, 158, 11, 0.3)'
        }
    });

    maintenanceFitAddon = new FitAddon.FitAddon();
    maintenanceTerminal.loadAddon(maintenanceFitAddon);
    maintenanceTerminal.open(termContainer);
    maintenanceFitAddon.fit();

    // Handle window resize
    window.addEventListener('resize', () => {
        if (maintenanceFitAddon) maintenanceFitAddon.fit();
    });

    // Send keyboard input to server
    maintenanceTerminal.onData((data) => {
        socket.emit('maintenance-input', data);
    });

    // Request server to start maintenance session
    isMaintenanceActive = true;
    socket.emit('start-maintenance', {
        robotNumber: robotNum,
        robotIP: robotIP,
        robotPassword: robotPassword
    });

    // Focus the terminal so keypresses work
    maintenanceTerminal.focus();
}

// Stop Maintenance and close modal
window.stopMaintenance = function () {
    if (isMaintenanceActive) {
        socket.emit('stop-maintenance');
    }
    closeMaintenanceModal();
}

function closeMaintenanceModal() {
    const modal = document.getElementById('maintenance-modal');
    modal.style.display = 'none';

    if (maintenanceTerminal) {
        maintenanceTerminal.dispose();
        maintenanceTerminal = null;
    }
    maintenanceFitAddon = null;
    isMaintenanceActive = false;
}

// Socket listeners for maintenance
socket.on('maintenance-output', (data) => {
    if (maintenanceTerminal) {
        maintenanceTerminal.write(data);
    }
});

socket.on('maintenance-stopped', () => {
    isMaintenanceActive = false;
});

// ==========================================
// CONVEYOR CONTROL MODE
// ==========================================
let conveyorRobotNum = null;

// Start Conveyor - Opens conveyor control modal
window.startConveyor = function () {
    // Check if robot is selected
    if (!selectedRobot) {
        alert('Please select a robot first!');
        return;
    }

    // Get robot number from input OR prompt
    let robotNum = robotNumberInput.value.trim();

    if (!robotNum) {
        robotNum = prompt('Enter Robot Number for Conveyor Control:');
        if (robotNum === null || !robotNum.trim()) {
            terminalOutput.textContent += '\nConveyor control cancelled\n';
            scrollToBottom(terminalOutput);
            return;
        }
        robotNum = robotNum.trim();
    }

    // Validate numeric
    if (!/^\d+$/.test(robotNum)) {
        alert('Robot Number must be numeric!');
        return;
    }

    // Fill the input field with the robot number
    robotNumberInput.value = robotNum;
    conveyorRobotNum = robotNum;

    // Show conveyor modal
    const modal = document.getElementById('conveyor-modal');
    const conveyorRobotId = document.getElementById('conveyor-robot-id');
    conveyorRobotId.textContent = robotNum;
    modal.style.display = 'flex';

    // Clear output
    const conveyorTerminal = document.getElementById('conveyor-terminal');
    conveyorTerminal.textContent = '⚙️ Ready to control conveyor...\n';
}

// Run Conveyor command
window.runConveyor = function (direction) {
    if (!conveyorRobotNum) {
        alert('No robot selected!');
        return;
    }

    if (!selectedRobot) {
        alert('Please select a robot type first!');
        return;
    }

    const conveyorTerminal = document.getElementById('conveyor-terminal');

    // Map direction to flag
    let flag = '';
    let description = '';

    if (direction === 'forward') {
        flag = '-c22';
        description = '⟳ Running conveyor FORWARD (Anti-clockwise)...';
    } else if (direction === 'backward') {
        flag = '-c21';
        description = '⟲ Running conveyor BACKWARD (Clockwise)...';
    }

    // Show initial message
    conveyorTerminal.textContent += `\n${description}\n`;
    scrollToBottom(conveyorTerminal);

    // Use the existing run-command mechanism
    // Include robotType which the server needs
    socket.emit('run-command', {
        robotType: selectedRobot.name,
        robotNumber: conveyorRobotNum,
        flag: flag,
        extraArgs: []
    });
}

// Close Conveyor modal
window.closeConveyorModal = function () {
    const modal = document.getElementById('conveyor-modal');
    modal.style.display = 'none';
    conveyorRobotNum = null;
}

window.sendControl = function (direction) {
    let command = '';

    if (currentControlMode === 'teleop') {
        const mapping = { 'up': 'T_W', 'down': 'T_X', 'left': 'T_A', 'right': 'T_D', 'stop': 'T_S' };
        command = mapping[direction];
    } else if (currentControlMode === 'maintenance') {
        const mapping = { 'up': 'W', 'down': 'X', 'stop': 'S' };
        command = mapping[direction];
    } else if (currentControlMode === 'conveyor') {
        const mapping = { 'up': '21', 'down': '22', 'stop': '0' };
        command = mapping[direction];
    }

    if (command) {
        sendCommand(command);
    } else {
        console.log(`No action for ${direction} in ${currentControlMode} mode`);
    }
}
