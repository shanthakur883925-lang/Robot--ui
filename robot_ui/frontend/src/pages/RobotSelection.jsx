import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Cpu, Activity, PlayCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const RobotSelection = () => {
    const navigate = useNavigate();
    const [robots, setRobots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(null); // Robot ID being validated
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/robots')
            .then(res => res.json())
            .then(data => {
                setRobots(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch robots:", err);
                setError("Failed to connect to backend. Is it running?");
                setLoading(false);
            });
    }, []);

    const handleSelectRobot = async (robot) => {
        setValidating(robot.id);
        setError(null);

        try {
            const res = await fetch(`http://localhost:8000/api/robots/${robot.id}/validate`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.success) {
                // Navigate to control page
                navigate(`/control/${robot.id}`);
            } else {
                setError(`Validation Failed for ${robot.name}: ${data.message}`);
                setValidating(null);
            }
        } catch (err) {
            setError(`Validation Error: ${err.message}`);
            setValidating(null);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading System...</div>;

    return (
        <div className="flex flex-col h-full p-8 md:p-12 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Monitor className="text-blue-500" size={32} />
                    ROBOT SELECTION
                </h1>
                <p className="text-gray-400">Select a unit to begin operations. Validation will run automatically.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-900/30 border border-red-500/50 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-red-400">System Alert</h3>
                        <p className="text-red-300 text-sm whitespace-pre-wrap">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {robots.map((robot) => (
                    <div
                        key={robot.id}
                        onClick={() => !validating && handleSelectRobot(robot)}
                        className={`industrial-card p-6 rounded-xl cursor-pointer relative overflow-hidden group ${validating === robot.id ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                        {/* Status Overlay for Validation */}
                        {validating === robot.id && (
                            <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <span className="text-blue-400 font-mono text-sm animate-pulse">VALIDATING...</span>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700 group-hover:border-blue-500/50 transition-colors">
                                <Cpu className="text-gray-400 group-hover:text-blue-400" />
                            </div>
                            <div className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                READY
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{robot.name}</h3>
                        <p className="text-sm text-gray-500 mb-6 font-mono">ID: {robot.id.toUpperCase()}</p>

                        <div className="flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                            <PlayCircle size={16} className="mr-2" />
                            <span>Initialize System</span>
                        </div>

                        {/* Hover effect accent */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RobotSelection;
