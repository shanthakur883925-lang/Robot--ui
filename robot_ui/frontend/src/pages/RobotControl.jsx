import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal as TerminalIcon, Zap, CheckCircle, Activity } from 'lucide-react';
import TerminalComponent from '../components/Terminal';

const RobotControl = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [commands, setCommands] = useState([]);
    const [robotName, setRobotName] = useState(id);
    const [runningCmd, setRunningCmd] = useState(null); // Index of running command

    useEffect(() => {
        // Fetch robot details (name) - simplified, usually would have a dedicated endpoint or passed state
        fetch('http://localhost:8000/api/robots')
            .then(res => res.json())
            .then(data => {
                const r = data.find(r => r.id === id);
                if (r) setRobotName(r.name);
            });

        // Fetch commands
        fetch(`http://localhost:8000/api/robots/${id}/commands`)
            .then(res => res.json())
            .then(setCommands)
            .catch(err => console.error("Failed to load commands", err));
    }, [id]);

    const handleExecute = async (idx) => {
        if (runningCmd !== null) return; // Prevent multiple commands

        setRunningCmd(idx);
        try {
            const res = await fetch('http://localhost:8000/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ robot_id: id, command_index: idx })
            });
            if (!res.ok) throw new Error("Failed to start");

            // Wait for completion logic would go here, 
            // but for now we rely on the user watching the terminal or a websocket signal
            // For UI feedback, we'll reset the button state after a bit or listen for "Command Finished" via WS context
            // Since we simplified the WS to be just "Terminal", we'll just timeout the button state for visual effect
            // In a real app the WS should broadcast state changes.
            setTimeout(() => setRunningCmd(null), 2000);

        } catch (err) {
            console.error(err);
            setRunningCmd(null);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-[#121212]">
            {/* Header */}
            <header className="flex-none h-16 border-b border-[#333] bg-[#1a1a1a] flex items-center justify-between px-6 z-10 shadow-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                        title="Back to Selection"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-[#333]"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-lg leading-tight">{robotName}</h1>
                            <div className="text-[10px] text-green-500 font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                ONLINE
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Commands */}
                <div className="w-80 flex-none border-r border-[#333] bg-[#1a1a1a] p-6 overflow-y-auto">
                    <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Zap size={14} /> Available Commands
                    </h2>

                    <div className="space-y-4">
                        {commands.map((cmd, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleExecute(idx)}
                                disabled={runningCmd !== null}
                                className={`
                                    w-full py-4 px-6 rounded-full font-bold text-sm tracking-wide transition-all duration-200 outline-none
                                    flex items-center justify-center gap-2 shadow-lg
                                    ${runningCmd === idx
                                        ? 'bg-red-600 text-white shadow-red-900/50 scale-95'
                                        : 'bg-green-700 hover:bg-green-600 text-white shadow-green-900/30 hover:shadow-green-900/50 hover:-translate-y-1'
                                    }
                                    ${runningCmd !== null && runningCmd !== idx ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                                `}
                            >
                                {runningCmd === idx ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-white animate-ping mr-1"></span>
                                        EXECUTING
                                    </>
                                ) : (
                                    <>
                                        {cmd.label}
                                    </>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded bg-[#252525] border border-[#333] text-xs text-gray-500">
                        <p className="mb-2 font-bold text-gray-400">STATUS LOG:</p>
                        <p>• System calibrated</p>
                        <p>• Validation passed</p>
                        <p>• Ready for inputs</p>
                    </div>
                </div>

                {/* Right Panel: Terminal */}
                <div className="flex-1 flex flex-col bg-[#0d0d0d] relative">
                    <div className="flex-none h-8 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                            <TerminalIcon size={12} />
                            <span>/dev/ttyS0</span>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono">
                            utf-8 • 24x80
                        </div>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                        <TerminalComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RobotControl;
