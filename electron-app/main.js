/*
    FIle        : main.js
    Version     : 1.0
    Description : main script to run the A++ IDE
    Dependencies: electron, path
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-14
*/
const { app, ipcMain, BrowserWindow, Menu } = require('electron');
const PATH = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: PATH.join(__dirname, 'src/assets/icons/logo_app.png')
    });

    Menu.setApplicationMenu(null)
    mainWindow.loadFile(PATH.join(__dirname, 'src/pages/home/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('quit-app', () => {
    app.quit();
});