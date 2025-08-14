/*
    FIle        : script.js
    Version     : 1.0
    Description : Editor script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-14
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
    FILE_INPUT.value = '';
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
    ipcRenderer.send('save-current-file', CODE);
});

function render_code_to_editor(_text) {
    CODE_EDITOR.textContent = _text;
    syntax_highlighting();
}

function updateEditorContent() {
    let text = CODE_EDITOR.innerText;
    const LINES = text.split(/\r?\n/);
    let html = '<pre><code><div style="display: flex; flex-direction: column;">';
    for (let line of LINES) {
        html += `<div class='code-line'>${line}</div>`;
    }
    html += '</div></code></pre>';
    CODE_EDITOR.innerHTML = html;
    placeCaretAtEnd(CODE_EDITOR);
    syntax_highlighting();
}

function placeCaretAtEnd(_el) {
    _el.focus();
    if (typeof window.getSelection != 'undefined'
        && typeof document.createRange != 'undefined') {
        var range = document.createRange();
        range.selectNodeContents(_el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}