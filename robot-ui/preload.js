const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    runScript: (scriptPath, args) => ipcRenderer.send('run-script', { scriptPath, args }),
    onScriptOutput: (callback) => ipcRenderer.on('script-output', (event, data) => callback(data)),
    onScriptSuccess: (callback) => ipcRenderer.on('script-success', (event, data) => callback(data)),
    onScriptError: (callback) => ipcRenderer.on('script-error', (event, data) => callback(data)),
    onScriptFailure: (callback) => ipcRenderer.on('script-failure', (event, data) => callback(data)),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
