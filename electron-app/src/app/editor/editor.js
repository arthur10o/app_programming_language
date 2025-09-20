/*
  ==============================================================================
  File        : editor.js
  Version     : 1.0
  Description : JavaScript file to manage the editor in A++ IDE
                - Save and load with a button
                - Auto-save based on user settings
                - Dynamic updating of editor content with formatting
                - Syntax highlighting based on user settings
                - IPC event management for interaction with the backend
  Author      : Arthur
  Created     : 2025-07-26
  Last Update : 2025-09-20
  ==============================================================================
*/
let user_settings = {};
let auto_save_interval = null;
let auto_save_debounce = null;
let last_saved_content = '';
let can_auto_save = false;

window.addEventListener('DOMContentLoaded', () => {
    const {syntax_highlighting} = require('../../common/syntaxHighlighting.js');

    const BUTTON_LOAD_CODE = document.getElementById('load-code');
    const BUTTON_SAVE_CODE = document.getElementById('save-code');
    const CODE_EDITOR = document.getElementById('code-editor');

    let lineNumberDiv = document.getElementById('line-numbers');
    if (!lineNumberDiv) {
        lineNumberDiv = document.createElement('div');
        lineNumberDiv.id = 'line-numbers';
        lineNumberDiv.style.position = 'absolute';
        lineNumberDiv.style.left = '0';
        lineNumberDiv.style.top = '0';
        lineNumberDiv.style.textAlign = 'right';
        lineNumberDiv.style.padding = '15px 0 0 10px';
        lineNumberDiv.style.opacity = '0.7';
        lineNumberDiv.style.pointerEvents = 'none';
        lineNumberDiv.style.fontFamily = 'inherit';
        lineNumberDiv.style.zIndex = '2';
        lineNumberDiv.style.userSelect = 'none';
        CODE_EDITOR.parentNode.style.position = 'relative';
        CODE_EDITOR.parentNode.insertBefore(lineNumberDiv, CODE_EDITOR);
    }

    CODE_EDITOR.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, user_settings?.preferences?.tabSize ? ' '.repeat(user_settings.preferences.tabSize) : ' ');
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertText', false, '\n');
        }
        setTimeout(updateLineNumbers, 0);
    });

    CODE_EDITOR.addEventListener('input', () => {
        update_theme();
        ipcRenderer.send('code-change');
        updateLineNumbers();
        if (user_settings?.preferences?.syntaxHighlighting) {
            syntax_highlighting();
        }
        if (user_settings?.preferences?.autoSave && can_auto_save) {
            if (auto_save_debounce) clearTimeout(auto_save_debounce);
            auto_save_debounce = setTimeout(() => {
                AUTO_SAVE();
            }, 5000);
        }
    });

    BUTTON_LOAD_CODE.addEventListener('click', () => {
        ipcRenderer.send('load-file');
    });

    BUTTON_SAVE_CODE.addEventListener('click', () => {
        const CODE = CODE_EDITOR.innerText;
        ipcRenderer.send('save-current-file', CODE);
        can_auto_save = true;
    });

    ipcRenderer.on('save code', (event) => {
        BUTTON_SAVE_CODE.click();
    });

    ipcRenderer.on('file-loaded', (event, _CONTENT) => {
        render_code_to_editor(_CONTENT);
        update_theme();
        can_auto_save = true;
    });

    ipcRenderer.on('file-loaded-error', (event, _message) => {
        ipcRenderer.send('show-popup', 'Error', _message, 'error', [], [{ label: "Close", action: null }], 0)
    });

    ipcRenderer.on('clear-editor', (event) => {
        CODE_EDITOR.innerText = '';
        updateLineNumbers();
        can_auto_save = false;
    });

    ipcRenderer.send('get-user-connected-information');

    ipcRenderer.on('received-connected-user-information', (event, _user_information) => {
        user_settings = _user_information;
        const AUTO_SAVE_ENABLED = user_settings?.preferences?.autoSave;

        if (AUTO_SAVE_ENABLED) {
            setup_auto_save();
        }
        updateLineNumbers();
    });

    function setup_auto_save() {
        window.addEventListener('beforeunload', () => {
            AUTO_SAVE();
        });

        auto_save_interval = setInterval(() => {
            AUTO_SAVE();
        }, 30000);
    }

    const GET_EDITOR_CONTENT_AS_TEXT = () => {
        return CODE_EDITOR.innerText;
    };

    const AUTO_SAVE = () => {
        if (!can_auto_save) return;
        const CURRENT_CONTENT = GET_EDITOR_CONTENT_AS_TEXT();
        if (CURRENT_CONTENT !== last_saved_content) {
            BUTTON_SAVE_CODE.click();
            last_saved_content = CURRENT_CONTENT;
        }
    };

    function render_code_to_editor(_text) {
        CODE_EDITOR.innerText = _text;
        updateLineNumbers();
        if (user_settings?.preferences?.syntaxHighlighting) {
            syntax_highlighting();
        }
    }

    function updateLineNumbers() {
        const showLineNumbers = user_settings?.preferences?.showLineNumbers;
        if (!showLineNumbers) {
            lineNumberDiv.style.opacity = '0';
            lineNumberDiv.innerHTML = '';
            return;
        }
        lineNumberDiv.style.opacity = '1';
        const text = CODE_EDITOR.innerText || '';
        const lines = text.split(/\r?\n/);
        let html = '';
        for (let i = 0; i < lines.length; i++) {
            html += `<div style='height:1.3em;display:flex;align-items:center;justify-content:flex-end;'>${i + 1}</div>`;
        }
        lineNumberDiv.innerHTML = html;
        lineNumberDiv.style.height = CODE_EDITOR.scrollHeight + 'px';
    }
});