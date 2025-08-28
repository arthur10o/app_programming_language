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
  Last Update : 2025-08-28
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

    CODE_EDITOR.addEventListener('input', () => {
        updateEditorContent();
        update_theme();
        ipcRenderer.send('code-change');
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
        const LINES = Array.from(CODE_EDITOR.querySelectorAll('.code-line')).map(el => el.textContent);
        const CODE = LINES.join('\n');
        ipcRenderer.send('save-current-file', CODE);
        can_auto_save = true;
    });

    ipcRenderer.on('save code', (event) => {
        BUTTON_SAVE_CODE.click();
    });

    ipcRenderer.on('file-loaded', (event, _CONTENT) => {
        render_code_to_editor(_CONTENT);
        updateEditorContent();
        update_theme();
        can_auto_save = true;
    });

    ipcRenderer.on('file-loaded-error', (event, _message) => {
        ipcRenderer.send('show-popup', 'Error', _message, 'error', [], [{ label: "Close", action: null }], 0)
    });

    ipcRenderer.on('clear-editor', (event) => {
        CODE_EDITOR.innerText = '';
        can_auto_save = false;
    });

    ipcRenderer.send('get-user-connected-information');

    ipcRenderer.on('received-connected-user-information', (event, _user_information) => {
        user_settings = _user_information;
        const AUTO_SAVE_ENABLED = user_settings?.preferences?.autoSave;

        if (AUTO_SAVE_ENABLED) {
            setup_auto_save();
        }
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
        const LINES = Array.from(CODE_EDITOR.querySelectorAll('.code-line')).map(el => el.textContent);
        return LINES.join('\n');
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
        CODE_EDITOR.textContent = _text;
        if (user_settings?.preferences?.syntaxHighlighting) {
            syntax_highlighting();
        }
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
        if (user_settings?.preferences?.syntaxHighlighting) {
            syntax_highlighting();
        }
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
});