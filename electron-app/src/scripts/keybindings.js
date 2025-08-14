/*
    FIle        : keybindings.js
    Version     : 1.0
    Description : Shortcut keyboard executor for A++ IDE
    Author      : Arthur
    Created     : 2025-08-14
    Last Update : 2025-08-14
*/
const { ipcRenderer } = require('electron');

let keybindings = {};
let pressed_keys = [];

window.addEventListener('load', () => {
    const DATA_PATH = path.resolve(__dirname, '../../data/keybindings.json');
    if (!fs.existsSync(DATA_PATH)) {
        console.error('Keyboard shortcut recovery error :', DATA_PATH);
        return;
    }

    try {
        const DATA = fs.readFileSync(DATA_PATH, 'utf8');
        keybindings = JSON.parse(DATA);
    } catch (error) {
        console.error('Error reading or parsing JSON file :', error);
        return;
    }
});

window.addEventListener('keydown', (_keydown) => {
    generate_key(_keydown);
});

window.addEventListener('keyup', () => {
    let total_shortcut = '';
    for (let i = 0; i < pressed_keys.length; i++ ) {
        total_shortcut += pressed_keys[i].toLowerCase() + '+';
    };
    total_shortcut = total_shortcut.slice(0, -1);
    const ACTIONS = keybindings[total_shortcut];
    if (ACTIONS) handle_shortcut(ACTIONS);
    pressed_keys = [];
});

function generate_key(_keydown) {
    if (!pressed_keys.includes(_keydown.key)) pressed_keys.push(_keydown.key);
}

async function handle_shortcut(_ACTION) {
    if (_ACTION == 'close ide') {
        ipcRenderer.send('quit-app');
    } else if (_ACTION == 'open file' && document.title == 'A++ IDE - Editor') {
        const FILE_INPUT = document.getElementById('file-input');
        FILE_INPUT.click();
    } else if (_ACTION == 'save file' && document.title == 'A++ IDE - Editor') {
        document.getElementById('save-code').click();
    }
}