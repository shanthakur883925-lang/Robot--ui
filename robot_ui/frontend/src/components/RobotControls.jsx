import React, { useState } from 'react';

const RobotControls = () => {
    const [robotId, setRobotId] = useState('101');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
    };

    const handleAction = async (action) => {
        if (!robotId) {
            addLog("Error: Robot ID is required", 'error');
            return;
        }

        setLoading(true);
        addLog(`Sending ${action.toUpperCase()} command to Robot ${robotId}...`);

        try {
            // Using a simple fetch wrapper. In dev, we assume proxy or direct.
            // Vite proxy should be set up, or we use full URL.
            // For now, let's assume we use absolute URL to localhost:8000 for simplicity in this env
            // In a real app we'd use environment variables.
            const response = await fetch(`http://localhost:8000/api/robot/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ robot_id: robotId })
            });

            const data = await response.json();

            if (response.ok) {
                addLog(`Success: ${action.toUpperCase()} ${robotId} - ${JSON.stringify(data)}`, 'success');
            } else {
                addLog(`Failed: ${data.detail || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            addLog(`Network Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel" style={{ height: '100%' }}>
            <div className="panel-header">
                <span className="panel-title">CONTROL PANEL</span>
                <div className="status-indicator">
                    <div className={`status-dot ${loading ? 'active animate-pulse' : 'idle'}`}></div>
                    {loading ? 'BUSY' : 'READY'}
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    TARGET ROBOT ID
                </label>
                <input
                    type="text"
                    className="input-industrial"
                    value={robotId}
                    onChange={(e) => setRobotId(e.target.value)}
                    placeholder="Enter Robot ID (e.g. 101)"
                />
            </div>

            <div className="grid-controls">
                <button
                    className="btn btn-primary"
                    onClick={() => handleAction('add')}
                    disabled={loading}
                >
                    ADD ROBOT
                </button>
                <button
                    className="btn btn-danger"
                    onClick={() => handleAction('remove')}
                    disabled={loading}
                >
                    REMOVE ROBOT
                </button>
                <button
                    className="btn btn-success"
                    onClick={() => handleAction('start')}
                    disabled={loading}
                >
                    START
                </button>
                <button
                    className="btn"
                    style={{ borderColor: 'var(--text-dim)' }}
                    onClick={() => handleAction('stop')}
                    disabled={loading}
                >
                    STOP
                </button>
                <button
                    className="btn"
                    style={{ gridColumn: 'span 2', borderColor: 'var(--primary)' }}
                    onClick={() => handleAction('toggle')}
                    disabled={loading}
                >
                    TOGGLE STATE
                </button>
            </div>

            <div className="panel-header" style={{ marginTop: 'auto', marginBottom: '0.5rem' }}>
                <span className="panel-title">SYSTEM LOGS</span>
            </div>
            <div className="log-panel" style={{ maxHeight: '200px', minHeight: '150px' }}>
                {logs.length === 0 && <div style={{ opacity: 0.5, padding: '0.5rem' }}>No activity</div>}
                {logs.map((log, i) => (
                    <div key={i} className={`log-entry ${log.type}`}>
                        <span style={{ color: '#555', marginRight: '0.5rem' }}>[{log.time}]</span>
                        {log.msg}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RobotControls;
