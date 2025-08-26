/*
    FIle        : main.js
    Version     : 1.0
    Description : main script to run the A++ IDE
    Dependencies: electron, path
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-26
*/
const { app, ipcMain, BrowserWindow, Menu, dialog } = require('electron');
const PATH = require('path');
const fs = require('fs');

let current_file_path = null;
let file_state = {};
let remove_path = false;
let dont_show_again = false;
let first_connection = false;

let CONNECTED_USER_FILE = JSON.parse(fs.readFileSync(PATH.resolve(__dirname, 'src/data/connected_user.json'), {mode: 0o600}));
let USER_FILE = JSON.parse(fs.readFileSync(PATH.resolve(__dirname, 'src/data/users.json')));

let CONNECTED_USER_ID = CONNECTED_USER_FILE.user_id;
let USER_INFORMATION = USER_FILE.find(user => user.user_id == CONNECTED_USER_ID);
let dont_show_message_behavior_close_file = USER_INFORMATION?.["don't_show_message_behavior_close_file"];
let dont_show_message_behavior_new_file = USER_INFORMATION?.["don't_show_message_behavior_new_file"];

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

    Menu.setApplicationMenu(null);

    if (CONNECTED_USER_FILE.cipher && CONNECTED_USER_FILE.nonce && CONNECTED_USER_FILE.user_id) {
        mainWindow.loadFile(PATH.join(__dirname, 'src/app/home/index.html'));
    } else {
        mainWindow.loadFile(PATH.join(__dirname, 'src/app/login/login.html'));
    }

    mainWindow.webContents.on('did-finish-load', () => {
        if (!first_connection && CONNECTED_USER_FILE.cipher && CONNECTED_USER_FILE.nonce && CONNECTED_USER_FILE.user_id) {
            mainWindow.webContents.send('show-pop-up-valid-session', CONNECTED_USER_ID, USER_INFORMATION, CONNECTED_USER_FILE);
            first_connection = true;
        }
        first_connection = true;
    });
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

ipcMain.on('get-user-information-id-user-connected', (event) => {
    CONNECTED_USER_FILE = JSON.parse(fs.readFileSync(PATH.resolve(__dirname, 'src/data/connected_user.json'), {mode: 0o600}));
    USER_FILE = JSON.parse(fs.readFileSync(PATH.resolve(__dirname, 'src/data/users.json')));

    CONNECTED_USER_ID = CONNECTED_USER_FILE.user_id;
    USER_INFORMATION = USER_FILE.find(user => user.user_id == CONNECTED_USER_ID);
});

ipcMain.on('show-popup', (event, title, message, type, inputs, buttons, autoClose) => {
    event.sender.send('display-popup', title, message, type, inputs, buttons, autoClose);
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

ipcMain.on('get-users-for-login', (event) => {
    const PATH_USERS = PATH.resolve(__dirname, 'src/data/users.json');
    let users = [];
    try {
        if (fs.existsSync(PATH_USERS)) {
            const FILE_DATA = fs.readFileSync(PATH_USERS, 'utf8');
            users = FILE_DATA.trim() ? JSON.parse(FILE_DATA) : [];
        }
    } catch (err) {
        console.error('Failed to read users.json:', err);
        return;
    }
    event.sender.send('received-users-information', users);
});

ipcMain.on('get-user-connected-information', (event) => {
    event.sender.send('received-connected-user-information', USER_INFORMATION);
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

ipcMain.on('save-session', (event, _encrypted_session) => {
    fs.writeFileSync('src/data/connected_user.json', JSON.stringify(_encrypted_session), {mode: 0o600});
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
    if (dont_show_message_behavior_new_file == null) {
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

            if (CONFIRM.checkboxChecked === true && (CONFIRM.response === 0 || CONFIRM.response === 1)) {
                const PATH_USERS_FILE = PATH.resolve(__dirname, 'src/data/users.json');
                let users = [];
                try {
                    const data = fs.readFileSync(PATH_USERS_FILE, 'utf8');
                    users = data.trim() ? JSON.parse(data) : [];
                    const userIndex = users.findIndex(u => u.user_id === CONNECTED_USER_ID);
                    if (userIndex !== -1) {
                        users[userIndex]["don't_show_message_behavior_new_file"] = (CONFIRM.response === 0) ? 'save' : 'dont-save';
                        fs.writeFileSync(PATH_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
                        dont_show_message_behavior_new_file = (CONFIRM.response === 0) ? 'save' : 'dont-save';
                    }
                } catch (err) {
                    console.error('Error updating user preferences:', err);
                }
            }

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
    } else if (dont_show_message_behavior_new_file == 'save') {
        event.sender.send('save code');
        event.sender.send('clear-editor');
        remove_path = true;
    } else if (dont_show_message_behavior_new_file == 'dont-save') {
        current_file_path = null;
        event.sender.send('clear-editor');
    } else {
        current_file_path = null;
        event.sender.send('clear-editor')
    }
});

ipcMain.on('close-file', async (event) => {
    if (dont_show_message_behavior_close_file == null) {
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

            if (CONFIRM.checkboxChecked === true && (CONFIRM.response === 0 || CONFIRM.response === 1)) {
                const PATH_USERS_FILE = PATH.resolve(__dirname, 'src/data/users.json');
                let users = [];
                try {
                    const data = fs.readFileSync(PATH_USERS_FILE, 'utf8');
                    users = data.trim() ? JSON.parse(data) : [];
                    const userIndex = users.findIndex(u => u.user_id === CONNECTED_USER_ID);
                    if (userIndex !== -1) {
                        users[userIndex]["don't_show_message_behavior_close_file"] = (CONFIRM.response === 0) ? 'save' : 'dont-save';
                        fs.writeFileSync(PATH_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
                        dont_show_message_behavior_close_file = (CONFIRM.response === 0) ? 'save' : 'dont-save';
                    }
                } catch (err) {
                    console.error('Error updating user preferences:', err);
                }
            }

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
    } else if (dont_show_message_behavior_close_file == 'save') {
        event.sender.send('save code');
        event.sender.send('clear-editor');
        remove_path = null;
    } else if (dont_show_message_behavior_close_file == 'dont-save') {
        current_file_path = null;
        event.sender.send('clear-editor');
    } else {
        current_file_path = null;
        event.sender.send('clear-editor');
    }
});