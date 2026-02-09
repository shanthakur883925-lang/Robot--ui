const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    // Modern styling
    backgroundColor: '#1a202c',
    show: false
  });

  win.loadFile('renderer/index.html');

  win.once('ready-to-show', () => {
    win.show();
  });

  // Handle script execution
  ipcMain.on('run-script', (event, { scriptPath, args }) => {
    let absoluteScriptPath = path.join(__dirname, 'scripts', scriptPath);
    const webAppScriptPath = path.join('/home/vlabuser2/.gemini/antigravity/scratch/robot-web-app/scripts', scriptPath);

    if (fs.existsSync(webAppScriptPath)) {
      absoluteScriptPath = webAppScriptPath;
    }
    console.log(`Running script: ${absoluteScriptPath} with args: ${args}`);

    // In a real app, ensure strict validation of scriptPath to prevent arbitrary execution
    // Here we assume scriptPath is either xvalidation.sh or validationzippy10_6_.sh

    const child = spawn(absoluteScriptPath, args);

    child.stdout.on('data', (data) => {
      win.webContents.send('script-output', data.toString());
    });

    child.stderr.on('data', (data) => {
      win.webContents.send('script-output', `ERROR: ${data.toString()}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        win.webContents.send('script-success', { scriptPath, args });
      } else {
        win.webContents.send('script-error', { scriptPath, args, code });
      }
    });

    child.on('error', (err) => {
      win.webContents.send('script-failure', err.message);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
