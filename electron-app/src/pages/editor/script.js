/*
    FIle        : script.js
    Version     : 1.0
    Description : Editor script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-11
*/
const {syntax_highlighting} = require('../../scripts/syntax_highlighting.js');

const BUTTON_LOAD_CODE = document.getElementById('load-code');
const FILE_INPUT = document.getElementById('file-input');
const BUTTON_SAVE_CODE = document.getElementById('save-code');
const CODE_EDITOR = document.getElementById('code-editor');

CODE_EDITOR.addEventListener('input', () => {
    updateEditorContent();
    update_theme();
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
            updateEditorContent();
            update_theme();
        };
        READER.readAsText(FILE);
    }
});

BUTTON_SAVE_CODE.addEventListener('click', () => {
    const LINES = Array.from(CODE_EDITOR.querySelectorAll('.code-line')).map(el => el.textContent);
    const CODE = LINES.join('\n');
    
    if (window.showSaveFilePicker) {
        (async () => {
            try {
                const OPTIONS = {
                    suggestedName: 'mon_code.a2plus',
                    types: [
                        {
                            description: 'Fichier A++',
                            accept: { 'text/plain': ['.a2plus'] }
                        }
                    ]
                };
                const HANDLE = await window.showSaveFilePicker(OPTIONS);
                const WRITABLE = await HANDLE.createWritable();
                await WRITABLE.write(CODE);
                await WRITABLE.close();
            } catch (err) {
            }
        })();
    } else {
        const BLOB = new Blob([CODE], { type: 'text/plain' });
        const A = document.createElement('a');
        A.href = URL.createObjectURL(BLOB);
        A.download = 'mon_code.a2plus';
        document.body.appendChild(A);
        A.click();
        document.body.removeChild(A);
        URL.revokeObjectURL(A.href);
    }
});

function render_code_to_editor(_text) {
    const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
    const LINES = _text.split('\n');

    let html = '<pre><code><div style="display: flex; flex-direction: column;">';
    for (let line of LINES) {
        const REPLACED = line.replace(/\t/g, TAB_DISPLAY);
        html += `<div class="code-line">${REPLACED}</div>`;
    }
    html += '</div></code></pre>';
    CODE_EDITOR.innerHTML = html;
    syntax_highlighting();
}

function updateEditorContent() {
    let text = CODE_EDITOR.innerText;
    const LINES = text.split(/\r?\n/);
    let html = '<pre><code><div style="display: flex; flex-direction: column;">';
    for (let line of LINES) {
        html += `<div class="code-line">${line}</div>`;
    }
    html += '</div></code></pre>';
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