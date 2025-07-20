const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, 'assets/icons/icon.png')
    });

    mainWindow.loadFile('home/index.html');
}

app.whenReady().then(createWindow);
