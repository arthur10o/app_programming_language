/*
    FIle        : script.js
    Version     : 1.0
    Description : Editor script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-07-27
*/
const {syntax_highlighting} = require('../../scripts/syntax_highlighting.js');

const fs = require('fs');
const path = require('path');

const BUTTON_LOAD_CODE = document.getElementById('load-code');
const FILE_INPUT = document.getElementById('file-input');

const BUTTON_SAVE_CODE = document.getElementById('save-code');
const CODE_EDITOR = document.getElementById('code-editor');

function updateEditorContent() {
    let text = CODE_EDITOR.innerText;
    const lines = text.split(/\r?\n/);
    let html = '<div style="display: flex; flex-direction: column;">';
    for (let line of lines) {
        html += `<div class="code-line">${line}</div>`;
    }
    html += '</div>';
    CODE_EDITOR.innerHTML = html;
    placeCaretAtEnd(CODE_EDITOR);
    syntax_highlighting();
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

CODE_EDITOR.addEventListener('input', () => {
    updateEditorContent();
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
            render_code_to_editor(CODE);
        };
        READER.readAsText(FILE);
    }
});

BUTTON_SAVE_CODE.addEventListener('click', () => {
    const LINES = Array.from(CODE_EDITOR.querySelectorAll('.code-line')).map(el => el.textContent);
    const code = LINES.join('\n');
    
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

function render_code_to_editor(_text) {
    const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
    const TAB_SIZE = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')).data_settings['tabulation-size'];
    const TAB_DISPLAY = ' '.repeat(TAB_SIZE);
    const LINES = _text.split('\n');

    let html = '<div style="display: flex; flex-direction: column;">';
    for (let line of LINES) {
        const replaced = line.replace(/\t/g, TAB_DISPLAY);
        html += `<div class="code-line">${replaced}</div>`;
    }
    html += '</div>';
    CODE_EDITOR.innerHTML = html;
    syntax_highlighting();
}