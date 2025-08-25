/*
  ==============================================================================
  File        : editor.js
  Version     : 1.0
  Description : JavaScript file to manage the editor in A++ IDE
                - Save and load with a button
                - Dynamic updating of editor content with formatting
                - Syntax highlighting
                - IPC event management for interaction with the backend
  Author      : Arthur
  Created     : 2025-07-26
  Last Update : 2025-08-25
  ==============================================================================
*/
window.addEventListener('DOMContentLoaded', () => {
    const {syntax_highlighting} = require('../../common/syntaxHighlighting.js');

    const BUTTON_LOAD_CODE = document.getElementById('load-code');
    const BUTTON_SAVE_CODE = document.getElementById('save-code');
    const CODE_EDITOR = document.getElementById('code-editor');

    CODE_EDITOR.addEventListener('input', () => {
        updateEditorContent();
        update_theme();
        ipcRenderer.send('code-change');
    });

    BUTTON_LOAD_CODE.addEventListener('click', () => {
        ipcRenderer.send('load-file');
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

    ipcRenderer.on('save code', (event) => {
        BUTTON_SAVE_CODE.click();
    });

    ipcRenderer.on('file-loaded', (event, _CONTENT) => {
        render_code_to_editor(_CONTENT);
        updateEditorContent();
        update_theme();
    });

    ipcRenderer.on('file-loaded-error', (event, _message) => {
        ipcRenderer.send('show-popup', 'Error', _message, 'error', [], [{ label: "Close", action: null }], 0)
    });

    ipcRenderer.on('clear-editor', (event) => {
        CODE_EDITOR.innerText = '';
    });
});