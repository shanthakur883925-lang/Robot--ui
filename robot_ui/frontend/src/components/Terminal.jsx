import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
    const terminalRef = useRef(null);
    const wsRef = useRef(null);
    const xtermRef = useRef(null);

    useEffect(() => {
        // Initialize xterm
        const term = new Terminal({
            theme: {
                background: '#1a1d24',
                foreground: '#e0e0e0',
                cursor: '#e6b400',
            },
            fontFamily: 'Roboto Mono, monospace',
            fontSize: 14,
            cursorBlink: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        if (terminalRef.current) {
            term.open(terminalRef.current);
            fitAddon.fit();
            xtermRef.current = term;
        }

        // Connect WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Check if we are in dev mode (vite proxy) or prod
        // We'll hardcode localhost for dev if needed, or relative
        // Assuming we proxy /ws in Vite config or direct connect to 8000
        const wsUrl = `ws://localhost:8000/ws/terminal`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            term.writeln('\x1b[32m[SYSTEM] Connected to Robot Terminal...\x1b[0m\r\n');
            const dims = fitAddon.proposeDimensions();
            if (dims) {
                ws.send(`RESIZE:${dims.rows},${dims.cols}`);
            }
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            term.writeln('\r\n\x1b[31m[SYSTEM] Connection lost.\x1b[0m');
        };

        term.onData(data => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        // Handle resize
        const handleResize = () => {
            fitAddon.fit();
            const dims = fitAddon.proposeDimensions();
            if (dims && ws.readyState === WebSocket.OPEN) {
                ws.send(`RESIZE:${dims.rows},${dims.cols}`);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (ws.readyState === WebSocket.OPEN) ws.close();
            term.dispose();
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default TerminalComponent;
