/*
    FIle        : main.js
    Version     : 1.0
    Description : main script to run the A++ IDE
    Dependencies: electron, path
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-20
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
        icon: PATH.join(__dirname, 'public/assets/icons/app-logo.png')
    });

    Menu.setApplicationMenu(null)
    mainWindow.loadFile(PATH.join(__dirname, 'src/app/home/index.html'));
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

ipcMain.on('register-user', (event, _new_user) => {
    const PATH_USERS_FILE = PATH.resolve(__dirname, 'src/data/users.json');
    let data_users = [];
    try {
        if (fs.existsSync(PATH_USERS_FILE)) {
            const FILE_DATA = fs.readFileSync(PATH_USERS_FILE, 'utf8');
            data_users = FILE_DATA.trim() ? JSON.parse(FILE_DATA) : {};
        }
    } catch (err) {
        console.error('Failed to read users.json:', err);
        return;
    }

    data_users.push(_new_user);

    try {
        fs.writeFileSync(PATH_USERS_FILE, JSON.stringify(data_users, null, 2));
        console.log("User registered successfully.");
    } catch (err) {
        console.error('Failed to write to users.json:', err);
    }
});

ipcMain.on('get-connected-user-information', (event) => {
    const PATH_CONNECTED_USERS_FILE = PATH.resolve(__dirname, 'src/data/connected_user.json');
    let data_users = [];
    try {
        if (fs.existsSync(PATH_CONNECTED_USERS_FILE)) {
            const FILE_DATA = fs.readFileSync(PATH_CONNECTED_USERS_FILE, 'utf8');
            data_users = FILE_DATA.trim() ? JSON.parse(FILE_DATA) : [];
        }
    } catch (err) {
        console.error('Failed to read users.json:', err);
        return;
    }
    event.sender.send('received-connected-user-information', data_users);
});

ipcMain.on('saved_connected_user', (event, _connected_user) => {
    const PATH_CONNECTED_USERS_FILE = PATH.resolve(__dirname, 'src/data/connected_user.json');
    let data_users = [];
    try {
        if (fs.existsSync(PATH_CONNECTED_USERS_FILE)) {
            const FILE_DATA = fs.readFileSync(PATH_CONNECTED_USERS_FILE, 'utf8');
            data_users = FILE_DATA.trim() ? JSON.parse(FILE_DATA) : [];
        }
    } catch (err) {
        console.error('Failed to read users.json:', err);
        return;
    }

    const EXISTING_USER = data_users.find(user =>
        user.connected_user &&
        user.connected_user.username.cipher === _connected_user.connected_user.username.cipher &&
        user.connected_user.username.nonce === _connected_user.connected_user.username.nonce
    );
    
    if (EXISTING_USER) {
        EXISTING_USER.connected_user.date_of_connection = _connected_user.connected_user.date_of_connection;
    } else {
        data_users = [_connected_user];
    }
    try {
        fs.writeFileSync(PATH_CONNECTED_USERS_FILE, JSON.stringify(data_users, null, 2));
        console.log("Connected user saved successfully.");
    } catch (err) {
        console.error('Failed to write to users.json:', err);
    }
});

ipcMain.on('get-default-keybindings', (event) => {
    const KEYBINDINGS_PATH = PATH.resolve(__dirname, 'src/data/keybindings.json');
    let keybindings = {};

    if (!fs.existsSync(KEYBINDINGS_PATH)) {
        console.log('Keyboard shortcut recovery error :', KEYBINDINGS_PATH);
        return;
    }

    try {
        const KEYBINDINGS = fs.readFileSync(KEYBINDINGS_PATH, 'utf8');
        event.sender.send('get-default-keybindings-reply', KEYBINDINGS);
    } catch (error) {
        console.log('Error reading or parsing JSON file :', error);
    }
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