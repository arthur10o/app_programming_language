/*
    FIle        : main.js
    Version     : 1.0
    Description : main script to run the A++ IDE
    Dependencies: electron, path
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-15
*/
const { app, ipcMain, BrowserWindow, Menu, dialog } = require('electron');
const PATH = require('path');
const fs = require('fs');

let current_file_path = null;
let file_state = {};
let remove_path = false;
let dont_show_again = false;

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

ipcMain.on('code-change', (event) => {
    if (current_file_path) {
        file_state[current_file_path] = false;
    }
});

ipcMain.on('save-current-file', async (event, _code) => {
    if (!current_file_path) {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Save file',
            defaultPath: 'untitled.a2plus',
            filters: [
                { name: 'File A++', extensions: ['a2plus'] },
                { name: 'All file', extensions: ['*'] }
            ]
        });

        if (!canceled && filePath) {
            fs.writeFileSync(filePath, _code, 'utf8');
            current_file_path = filePath;
            file_state[current_file_path] = true;
        }
    } else {
        fs.writeFileSync(current_file_path, _code, 'utf8');
        file_state[current_file_path] = true;
    }

    if (remove_path) {
        current_file_path = null;
        remove_path = false;
    }
});

ipcMain.on('load-file', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Load file',
        properties: ['openFile'],
        filters: [
            { name: 'File A++', extensions: ['a2plus'] },
            { name: 'All file', extensions: ['*'] }
        ]
    });
    if (filePaths.length > 0 && !canceled) {
        current_file_path = filePaths[0];
        try {
            const CONTENT = fs.readFileSync(current_file_path, 'utf-8');
            event.sender.send('file-loaded', CONTENT);
            file_state[current_file_path] = true;
        } catch (err) {
            console.error('Error reading file :', err);
            event.sender.send('file-loaded-error', 'An error occurred while reading the file. Please check if the file is accessible and try again.');
        }
    }
});

ipcMain.on('new-file', async (event) => {
    if (file_state[current_file_path] == false) {
        const CONFIRM = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Save', 'Do not save', 'Cancel'],
            defaultId: '1',
            cancelId: '1',
            title: 'Create a new file',
            message: 'The current file contains unsaved changes. Do you want to save the changes before creating a new file ?',
            checkboxLabel: "Do not show this message again",
            checkboxChecked: dont_show_again,
        });

        if (CONFIRM.response == 0) {                // Save
            event.sender.send('save code');
            event.sender.send('clear-editor');
            remove_path = true;
        } else if (CONFIRM.response == 1) {         // Do not save
            current_file_path = null;
            event.sender.send('clear-editor');
        }
    } else {
        current_file_path = null;
        event.sender.send('clear-editor')
    }
});

ipcMain.on('close-file', async (event) => {
    if (file_state[current_file_path] == false) {
        const CONFIRM = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Save', 'Do not save', 'Cancel'],
            defaultId: '1',
            cancelId: '1',
            title: 'File not saved',
            message: 'You have unsaved changes in the current file. Would you like to save them before closing ?',
            checkboxLabel: "Do not show this message again",
            checkboxChecked: dont_show_again,
        });

        if (CONFIRM.response == 0) {            // Save
            event.sender.send('save code');
            event.sender.send('clear-editor');
            remove_path = null;
        } else if (CONFIRM.response == 1) {     // Do not save
            current_file_path = null;
            event.sender.send('clear-editor');
        }
    } else {
        current_file_path = null;
        event.sender.send('clear-editor')
    }
});

// [TODO] "Ne plus afficher ce message" à ajouter dans les settings user