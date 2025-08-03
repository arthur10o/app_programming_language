/*
    FIle        : script.js
    Version     : 1.0
    Description : Editor script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-07-27
*/
const {syntax_highlighting} = require('../../scripts/syntax_highlighting.js');

const BUTTON_LOAD_CODE = document.getElementById('load-code');
const FILE_INPUT = document.getElementById('file-input');

const BUTTON_SAVE_CODE = document.getElementById('save-code');
const CODE_EDITOR = document.getElementById('code-editor');

CODE_EDITOR.addEventListener('input', () => {
    syntax_highlighting();
});

BUTTON_LOAD_CODE.addEventListener('click', () => {
    FILE_INPUT.click();
});

FILE_INPUT.addEventListener('change', (event) => {
    const FILE = event.target.files[0];
    if (FILE) {
        const READER = new FileReader();
        READER.onload = (e) => {
            const CODE = e.target.result;
            const CODE_EDITOR = document.getElementById('code-editor');
            CODE_EDITOR.value = CODE;
        };
        READER.readAsText(FILE);
    }
});

BUTTON_SAVE_CODE.addEventListener('click', () => {
    const code = CODE_EDITOR.value;
    if (window.showSaveFilePicker) {
        (async () => {
            try {
                const options = {
                    suggestedName: 'mon_code.a2plus',
                    types: [
                        {
                            description: 'Fichier A++',
                            accept: { 'text/plain': ['.a2plus'] }
                        }
                    ]
                };
                const handle = await window.showSaveFilePicker(options);
                const writable = await handle.createWritable();
                await writable.write(code);
                await writable.close();
            } catch (err) {
            }
        })();
    } else {
        const blob = new Blob([code], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mon_code.a2plus';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
});