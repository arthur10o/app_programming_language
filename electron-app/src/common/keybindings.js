/*
  ==============================================================================
  File        : keybindings.js
  Version     : 1.0
  Description : JavaScript file to manage the keybindings in A++ IDE
                - Functionality to execute commands based on keyboard shortcuts
  Author      : Arthur
  Created     : 2025-08-14
  Last Update : 2025-10-06
  ==============================================================================
*/
const { ipcRenderer } = require('electron');

let keybindings = {};
let pressed_keys = [];
let show_popup_find_replace = false;
let is_replace_mode = false;

window.addEventListener('load', () => {
    const DATA_PATH = path.resolve(__dirname, '../../data/keybindings.json');
    if (!fs.existsSync(DATA_PATH)) {
        ipcRenderer.send('show-popup', 'keybindings_file_missing', 'keybindings_file_missing_message', 'error', [], [{ label: "close_button", action: null }], 0);
        return;
    }

    try {
        const DATA = fs.readFileSync(DATA_PATH, 'utf8');
        keybindings = JSON.parse(DATA);
    } catch (error) {
        ipcRenderer.send('show-popup', 'keybindings_load_error', 'keybindings_load_message_error', 'error', [], [{ label: "close_button", action: null }], 0);
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

document.getElementById('searchInput').addEventListener('input', () => {
    if (!show_popup_find_replace) return;
    search();
});

function generate_key(_keydown) {
    if (!pressed_keys.includes(_keydown.key)) pressed_keys.push(_keydown.key);
}

async function comment_line() {
    const CODE_EDITOR = document.getElementById('code-editor');
    if (!CODE_EDITOR) return;


    let syntax_highlighting;
    try {
        syntax_highlighting = require('./syntaxHighlighting.js').syntax_highlighting;
    } catch (e) {
        try {
            syntax_highlighting = require('../common/syntaxHighlighting.js').syntax_highlighting;
        } catch (e2) {}
    }

    const SELECTION = window.getSelection();
    if (!SELECTION.rangeCount) return;
    const RANGE = SELECTION.getRangeAt(0);


    let anchor_pos = get_caret_character_offset_within(CODE_EDITOR, RANGE.startContainer, RANGE.startOffset);
    let focus_pos = get_caret_character_offset_within(CODE_EDITOR, RANGE.endContainer, RANGE.endOffset);
    let sel_start = Math.min(anchor_pos, focus_pos);
    let sel_end = Math.max(anchor_pos, focus_pos);

    let text = CODE_EDITOR.innerText;
    let lines = text.split('\n');

    let isSingleLine = (sel_start === sel_end);
    let char_count = 0;
    let start_line = 0;
    let end_line = 0;
    for (let i = 0; i < lines.length; i++) {
        if (char_count <= sel_start) start_line = i;
        if (char_count < sel_end) end_line = i;
        char_count += lines[i].length + 1;
    }
    if (isSingleLine) {
        start_line = end_line = start_line;
    }

    let atLeastOneNotCommented = false;
    for (let i = start_line; i <= end_line; i++) {
        if (!lines[i].trim().startsWith('//')) {
            atLeastOneNotCommented = true;
            break;
        }
    }

    let newLines = [...lines];
    let delta = 0;
    if (atLeastOneNotCommented) {
        for (let i = start_line; i <= end_line; i++) {
            if (!lines[i].trim().startsWith('//')) {
                newLines[i] = '// ' + newLines[i];
                delta += 3;
            }
        }
    } else {
        for (let i = start_line; i <= end_line; i++) {
            let before = newLines[i];
            newLines[i] = newLines[i].replace(/^\s*\/\/[ ]?/, '');
            delta -= before.length - newLines[i].length;
        }
    }

    CODE_EDITOR.innerText = newLines.join('\n');

    if (typeof syntax_highlighting === 'function') {
        setTimeout(() => syntax_highlighting(), 0);
    }

    setTimeout(() => {
        let new_sel_start = sel_start;
        let new_sel_end = sel_end;
        if (isSingleLine) {
            if (lines[start_line].trim().startsWith('//')) {
                if (sel_start - charIndexOfLine(lines, start_line) >= 3) {
                    new_sel_start -= 3;
                    new_sel_end -= 3;
                }
            } else {
                if (sel_start - charIndexOfLine(lines, start_line) > 0) {
                    new_sel_start += 3;
                    new_sel_end += 3;
                }
            }
        } else {
            new_sel_end += delta;
        }
        setCaretPosition(CODE_EDITOR, new_sel_start, new_sel_end);
    }, 0);
}

function charIndexOfLine(lines, lineNum) {
    let idx = 0;
    for (let i = 0; i < lineNum; i++) {
        idx += lines[i].length + 1;
    }
    return idx;
}

function setCaretPosition(element, start, end) {
    let range = document.createRange();
    let sel = window.getSelection();
    let charIndex = 0, startNode = null, startOffset = 0, endNode = null, endOffset = 0;

    function traverse(node) {
        if (node.nodeType === 3) {
            let nextCharIndex = charIndex + node.length;
            if (!startNode && start >= charIndex && start <= nextCharIndex) {
                startNode = node;
                startOffset = start - charIndex;
            }
            if (!endNode && end >= charIndex && end <= nextCharIndex) {
                endNode = node;
                endOffset = end - charIndex;
            }
            charIndex = nextCharIndex;
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i]);
            }
        }
    }
    traverse(element);
    if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function get_caret_character_offset_within(_element, _node, _offset) {
    let range = document.createRange();
    range.selectNodeContents(_element);
    range.setEnd(_node, _offset);
    return range.toString().length;
}

async function delete_current_line() {
    const CODE_EDITOR = document.getElementById('code-editor');
    if (!CODE_EDITOR) return;

    const SELECTION = window.getSelection();
    if (!SELECTION.rangeCount) return;
    const RANGE = SELECTION.getRangeAt(0);

    let caret_pos = get_caret_character_offset_within(CODE_EDITOR, RANGE.startContainer, RANGE.startOffset);

    let text = CODE_EDITOR.innerText;
    let lines = text.split('\n');
    let char_count = 0;
    let line_to_delete = 0;
    for (let i = 0; i < lines.length; i++) {
        if (caret_pos >= char_count && caret_pos <= char_count + lines[i].length) {
            line_to_delete = i;
            break;
        }
        char_count += lines[i].length + 1;
    }

    lines.splice(line_to_delete, 1);
    CODE_EDITOR.innerText = lines.join('\n');

    let new_caret = 0;
    for (let i = 0; i < line_to_delete && i < lines.length; i++) {
        new_caret += lines[i].length + 1;
    }
    setCaretPosition(CODE_EDITOR, new_caret, new_caret);
}

function toggle_replace_find_mode(_action) {
    const ROWS = Array.from(document.getElementsByClassName('replace-row'));
    const ACTIONS = Array.from(document.getElementsByClassName('actions'));
    if (_action == 'find') {
        ROWS.forEach(row => { row.style.display = 'none'; });
        ACTIONS.forEach(row => { row.style.display = 'none'; });
        is_replace_mode = false;
    } else {
        ROWS.forEach(row => { row.style.display = 'flex'; });
        ACTIONS.forEach(row => { row.style.display = 'flex'; });
        is_replace_mode = true;
    }
}

function search() {
    const SEARCH_INPUT = document.getElementById('searchInput');
    const SEARCH_VALUE = SEARCH_INPUT.value;
    if (!SEARCH_VALUE) return;

    const CODE_EDITOR = document.getElementById('code-editor');
    if (!CODE_EDITOR) return;

    const CONTENT = CODE_EDITOR.innerText;
    let index = 0;
    const MATCHES = [];

    while ((index = CONTENT.indexOf(SEARCH_VALUE, index)) !== -1) {
        MATCHES.push(index);
        index += SEARCH_VALUE.length;
    }

    highlight_matches(MATCHES, SEARCH_VALUE);

}

function highlight_matches(_matches, _searchValue) {
    const CODE_EDITOR = document.getElementById('code-editor');
    const TEXT = CODE_EDITOR.innerText;
    if (!CODE_EDITOR) return;

    let highlighted_text = '';
    let last_index = 0;

    _matches.forEach((match_index, i) => {
        highlighted_text += TEXT.slice(last_index, match_index);
        highlighted_text += `<span class="highlight">${TEXT.slice(match_index, match_index + _searchValue.length)}</span>`;
        last_index = match_index + _searchValue.length;
    });

    highlighted_text += TEXT.slice(last_index);
    CODE_EDITOR.innerHTML = highlighted_text;
}

async function handle_shortcut(_ACTION) {
    if (_ACTION == 'close ide') {
        ipcRenderer.send('quit-app');
    } else if (_ACTION == 'open file' && (document.title == 'A++ IDE - Editor' || document.title == 'A++ IDE - Éditeur')) {
        const BUTTON_LOAD_CODE = document.getElementById('load-code');
        BUTTON_LOAD_CODE.click();
    } else if (_ACTION == 'save file' && (document.title == 'A++ IDE - Editor' || document.title == 'A++ IDE - Éditeur')) {
        document.getElementById('save-code').click();
    } else if (_ACTION == 'save file' && (document.title == 'A++ IDE - Settings' || document.title == 'A++ IDE - Paramètres' || document.title == 'A++ IDE - Configuración')) {
        document.getElementById('save-settings').click();
    } else if (_ACTION == 'new file' && (document.title == 'A++ IDE - Editor' || document.title == 'A++ IDE - Éditeur')) {
        ipcRenderer.send('new-file');
    } else if (_ACTION == 'close file' && (document.title == 'A++ IDE - Editor' || document.title == 'A++ IDE - Éditeur')) {
        ipcRenderer.send('close-file');
    } else if (_ACTION == 'comment line') {
        await comment_line();
    } else if (_ACTION == 'remove line') {
        await delete_current_line();
    } else if (_ACTION == 'toggle terminal' || _ACTION == 'toggle terminal (alternative)') {
        const FORBIDEN_PAGES = [
            'A++ IDE - Console',
            'A++ IDE - Consola',
            'A++ IDE - Login',
            'A++ IDE - Iniciar sesión',
            'A++ IDE - Connexion',
            'A++ IDE - Sign Up',
            'A++ IDE - Registrarse',
            'A++ IDE - Inscription'
        ]
        const CURRENT_FILE = document.title || '';
        if (FORBIDEN_PAGES.includes(CURRENT_FILE)) return;
        if (document.querySelector('.popup-overlay')) return;
        window.location.href = '../console/console.html';
    } else if (_ACTION == 'log out' || _ACTION == 'change account') {
        const FORBIDEN_PAGES = [
            'A++ IDE - Login',
            'A++ IDE - Iniciar sesión',
            'A++ IDE - Connexion',
            'A++ IDE - Sign Up',
            'A++ IDE - Registrarse',
            'A++ IDE - Inscription'
        ]
        const CURRENT_FILE = document.title || '';
        if (FORBIDEN_PAGES.includes(CURRENT_FILE)) return;
        window.location.href = '../login/login.html';
    } else if (_ACTION == 'full screen') {
        ipcRenderer.send('toggle-fullscreen');
    } else if (_ACTION == 'find' || _ACTION == 'replace') {
        const AUTORIZED_PAGES = [
            'A++ IDE - Console',
            'A++ IDE - Consola',
            'A++ IDE - Editor',
            'A++ IDE - Éditeur'
        ]

        const SELECTION = window.getSelection();
        const RANGE = SELECTION.rangeCount ? SELECTION.getRangeAt(0) : null;

        if (!AUTORIZED_PAGES.includes(document.title)) return;
        if (show_popup_find_replace) {
            if ((_ACTION === 'find' && !is_replace_mode) || (_ACTION === 'replace' && is_replace_mode)) {
                document.getElementById('searchReplacePanel').style.display = 'none';
                show_popup_find_replace = false;
            } else {
                toggle_replace_find_mode(_ACTION);
                const SEARCH_INPUT = document.getElementById('searchInput');
                if (SEARCH_INPUT && SEARCH_INPUT.offsetParent !== null) {
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            SEARCH_INPUT.focus();
                        });
                    }, 0);
                }
                if (SELECTION && RANGE) {
                    SEARCH_INPUT.value = RANGE.toString();
                    setTimeout(() => {
                        search();
                    }, 0);
                }
            }
        } else {
            document.getElementById('searchReplacePanel').style.display = 'block';
            toggle_replace_find_mode(_ACTION);
            const SEARCH_INPUT = document.getElementById('searchInput');
            if (SEARCH_INPUT && SEARCH_INPUT.offsetParent !== null) {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        SEARCH_INPUT.focus();
                    });
                }, 0);
            }
            if (SELECTION && RANGE) {
                SEARCH_INPUT.value = RANGE.toString();
                setTimeout(() => {
                    search();
                }, 0);
            }
            show_popup_find_replace = true;
        }
    } else {
        return;
    }

    const CODE_EDITOR = document.getElementById('code-editor');
    if (CODE_EDITOR) {
        const event = new Event('input', { bubbles: true });
        CODE_EDITOR.dispatchEvent(event);
    }
}