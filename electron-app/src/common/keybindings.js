/*
  ==============================================================================
  File        : keybindings.js
  Version     : 1.0
  Description : JavaScript file to manage the keybindings in A++ IDE
                - Functionality to execute commands based on keyboard shortcuts
  Author      : Arthur
  Created     : 2025-08-14
  Last Update : 2025-11-29
  ==============================================================================
*/
const { ipcRenderer } = require('electron');

let keybindings = {};
let pressed_keys = [];
let undo_stack = [];
let redo_stack = [];
let show_popup_find_replace = false;
let is_replace_mode = false;
let last_search = '';
let current_index_navigate_search_result = -1;
const MAX_HISTORY_UNDO_REDO = 100;

ipcRenderer.send('get-user-connected-information');
ipcRenderer.on('received-connected-user-information', (event, _user_information) => {
    keybindings = _user_information?.keybindings || {};
});

window.addEventListener('load', () => {
    const CODE_EDITOR = document.getElementById('code-editor') || document.getElementById('console-output');
    if (CODE_EDITOR) {
        CODE_EDITOR.addEventListener('input', () => {
            save_state_undo_redo();
            const COUNT_DISPLAY = document.getElementById('searchResultsIndex');
            const SEARCH_INPUT = document.getElementById('searchInput');
            if (!SEARCH_INPUT || ! show_popup_find_replace || !SEARCH_INPUT.value.trim()) {
                removeHighlights(CODE_EDITOR);
                if (COUNT_DISPLAY) COUNT_DISPLAY.textContent = '0';
                return;
            }

            try {
                syntax_highlighting();
            } catch(_) {
                try {
                    syntax_highlighting();
                } catch(_) {}
            }
            search();
        });
    }

    const ARROW_UP = document.getElementsByClassName('arrow-up');
    if (ARROW_UP) {
        ARROW_UP[0].addEventListener('click', () => {
            navigate_search_result('up');
        });
    }

    const ARROW_DOWN = document.getElementsByClassName('arrow-down');
    if (ARROW_DOWN) {
        ARROW_DOWN[0].addEventListener('click', () => {
            navigate_search_result('down');
        });
    }

    const SEARCH_INPUT = document.getElementById('searchInput');
    if (SEARCH_INPUT) {
        SEARCH_INPUT.addEventListener('input', () => {
            if (!show_popup_find_replace) return;
            search();
        });
    }

    const REPLACE_BUTTON = document.getElementById('replaceBtn');
    if (REPLACE_BUTTON) {
        REPLACE_BUTTON.addEventListener('click', async () => {
            await replace('one');
        });
    }

    const REPLACE_ALL_BUTTON = document.getElementById('replaceAllBtn');
    if (REPLACE_ALL_BUTTON) {
        REPLACE_ALL_BUTTON.addEventListener('click', async () => {
            await replace('all');
        });
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

async function comment_line() {
    const CODE_EDITOR = document.getElementById('code-editor');
    if (!CODE_EDITOR) return;

    save_state_undo_redo();

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

    save_state_undo_redo();

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

async function replace(_to_replace) {
    if (!show_popup_find_replace) return;
    if (document.getElementById('searchResultsIndex').innerText == 0) return;

    save_state_undo_redo();

    let search_result;
    if (_to_replace == 'all') search_result = document.querySelectorAll('span.highlight');
    else if (_to_replace == 'one') search_result = document.querySelectorAll('.current-highlight');
    if (search_result.length == 0) return;

    const VALUE_TO_REPLACE = document.getElementById('replaceInput').value;
    if (VALUE_TO_REPLACE.length == 0) return;
    search_result.forEach(element => {
        if (element.textContent != undefined) {
            element.textContent = VALUE_TO_REPLACE;
        }
    });
    current_index_navigate_search_result--;
    search();
    navigate_search_result('down');
}

async function search() {
    const SEARCH_INPUT = document.getElementById('searchInput');
    const SEARCH_VALUE = SEARCH_INPUT.value.trim();
    const COUNT_DISPLAY = document.getElementById('search-count');
    if (!SEARCH_VALUE) {
        removeHighlights(document.getElementById('code-editor'));
        if (COUNT_DISPLAY) COUNT_DISPLAY.textContent = '';
        return;
    }

    last_search = SEARCH_INPUT.value;
    const CODE_EDITOR = document.getElementById('code-editor') || document.getElementById('console-output');
    if (!CODE_EDITOR) return;

    removeHighlights(CODE_EDITOR);

    const regex = new RegExp(SEARCH_VALUE, 'gi');
    let matchCount = 0;

    function highlightNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const matches = [...node.nodeValue.matchAll(regex)];
            if (matches.length > 0) {
                const span = document.createElement('span');
                let replaced = node.nodeValue.replace(regex, (m) => {
                    matchCount++;
                    return `<span class="highlight">${m}</span>`;
                });
                span.innerHTML = replaced;
                node.replaceWith(...span.childNodes);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
            node.childNodes.forEach(highlightNode);
        }
    }

    CODE_EDITOR.childNodes.forEach(highlightNode);
    document.getElementById('searchResultsIndex').innerText = matchCount;
}

function removeHighlights(container) {
    const highlights = container.querySelectorAll('span.highlight');
    highlights.forEach(span => {
        const parent = span.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
    });
}

function navigate_search_result(_direction) {
    if (!show_popup_find_replace) return;

    const SEARCH_RESULT = document.querySelectorAll('span.highlight');
    if (SEARCH_RESULT.length == 0) return;

    if (_direction == 'up') {
        current_index_navigate_search_result = (current_index_navigate_search_result - 1 + SEARCH_RESULT.length) % SEARCH_RESULT.length;
    } else if (_direction == 'down') {
        current_index_navigate_search_result = (current_index_navigate_search_result + 1) % SEARCH_RESULT.length;
    }

    const CURRENT_HIGHLIGHT = SEARCH_RESULT[current_index_navigate_search_result];
    CURRENT_HIGHLIGHT.scrollIntoView({behavior: 'smooth', block: 'center'});

    SEARCH_RESULT.forEach(span => span.classList.remove('current-highlight'));
    CURRENT_HIGHLIGHT.classList.add('current-highlight');
}

function save_state_undo_redo() {
    const CODE_EDITOR = document.getElementById('code-editor');
    const CURRENT_STATE = document.getElementById('code-editor').innerText;

    const SELECTION = window.getSelection();
    let start = 0;
    let end = 0;
    if (SELECTION.rangeCount > 0) {
        const RANGE = SELECTION.getRangeAt(0);
        start = get_caret_character_offset_within(CODE_EDITOR, RANGE.startContainer, RANGE.startOffset);
        end = get_caret_character_offset_within(CODE_EDITOR, RANGE.endContainer, RANGE.endOffset);
    }

    const STATE = {
        text: CURRENT_STATE,
        selection_start: start,
        selection_end: end
    };

    const LAST_STATE = undo_stack[undo_stack.length - 1];
    if (!LAST_STATE || LAST_STATE.text !== CURRENT_STATE) {
        undo_stack.push(STATE);

        if (undo_stack.length > MAX_HISTORY_UNDO_REDO) {
            undo_stack.shift();
        }
    }
}

function undo() {
    if (undo_stack.length <= 1) return;

    const CODE_EDITOR = document.getElementById('code-editor');
    const CURRENT_STATE = {
        text: CODE_EDITOR.innerText,
        selection_start: window.getSelection().anchorOffset,
        selection_end: window.getSelection().focusOffset
    };
    redo_stack.push(CURRENT_STATE);

    undo_stack.pop();
    const PREVIOUS_STATE = undo_stack[undo_stack.length - 1];

    CODE_EDITOR.innerText  = PREVIOUS_STATE.text;

    setTimeout(() => {
        setCaretPosition(CODE_EDITOR, PREVIOUS_STATE.selection_start, PREVIOUS_STATE.selection_end);
    }, 0);
}

function redo() {
    if (redo_stack.length == 0) return;

    const CODE_EDITOR = document.getElementById('code-editor');
    const CURRENT_STATE = {
        text: CODE_EDITOR.innerText,
        selection_start: window.getSelection().anchorOffset,
        selection_end: window.getSelection().focusOffset
    };

    if (undo_stack.length == 0 || undo_stack[undo_stack.length - 1].text !== CURRENT_STATE.text) {
        undo_stack.push(CURRENT_STATE);

        if (undo_stack.length > MAX_HISTORY_UNDO_REDO) {
            undo_stack.shift();
        }
    }
    
    const NEXT_STATE = redo_stack.pop();
    CODE_EDITOR.innerText = NEXT_STATE.text;

    setTimeout(() => {
        setCaretPosition(CODE_EDITOR, NEXT_STATE.selection_start, NEXT_STATE.selection_end);
    }, 0);
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
    } else if (_ACTION == 'open settings') {
        const FORBIDEN_PAGES = [
            'A++ IDE - Settings',
            'A++ IDE - Configuración',
            'A++ IDE - Paramètres',
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
        window.location.href = '../settings/settings.html';
    }  else if (_ACTION == 'open editor') {
        const FORBIDEN_PAGES = [
            'A++ IDE - Editor',
            'A++ IDE - Editor',
            'A++ IDE - Éditeur',
            'A++ IDE - Login',
            'A++ IDE - Iniciar sesión',
            'A++ IDE - Connexion',
            'A++ IDE - Sign Up',
            'A++ IDE - Registrarse',
            'A++ IDE - Inscription'
        ];
        const CURRENT_FILE = document.title || '';
        if (FORBIDEN_PAGES.includes(CURRENT_FILE)) return;
        if (document.querySelector('.popup-overlay')) return;
        window.location.href = '../editor/editor.html';
    } else if (_ACTION == 'open home') {
        const FORBIDEN_PAGES = [
            'A++ IDE - Home',
            'A++ IDE - Inicio',
            'A++ IDE - Accueil',
            'A++ IDE - Login',
            'A++ IDE - Iniciar sesión',
            'A++ IDE - Connexion',
            'A++ IDE - Sign Up',
            'A++ IDE - Registrarse',
            'A++ IDE - Inscription'
        ];
        const CURRENT_FILE = document.title || '';
        if (FORBIDEN_PAGES.includes(CURRENT_FILE)) return;
        if (document.querySelector('.popup-overlay')) return;
        window.location.href = '../home/index.html';
    } else if (_ACTION == 'full screen') {
        ipcRenderer.send('toggle-fullscreen');
    } else if (_ACTION == 'find' || _ACTION == 'replace') {
        const AUTORIZED_PAGES_SEARCH = [
            'A++ IDE - Console',
            'A++ IDE - Consola',
            'A++ IDE - Editor',
            'A++ IDE - Éditeur'
        ];
        const AUTORIZED_PAGES_REPLACE = [
            'A++ IDE - Editor',
            'A++ IDE - Éditeur'
        ];

        const SELECTION = window.getSelection();
        const RANGE = SELECTION.rangeCount ? SELECTION.getRangeAt(0) : null;

        if (_ACTION == 'find' && !AUTORIZED_PAGES_SEARCH.includes(document.title)) return;
        if (_ACTION == 'replace' && ! AUTORIZED_PAGES_REPLACE.includes(document.title)) return;
        if (show_popup_find_replace) {
            if ((_ACTION === 'find' && !is_replace_mode) || (_ACTION === 'replace' && is_replace_mode)) {
                document.getElementById('searchReplacePanel').style.display = 'none';
                show_popup_find_replace = false;
            } else {
                toggle_replace_find_mode(_ACTION);
                const SEARCH_INPUT = document.getElementById('searchInput');
                if (SEARCH_INPUT && SEARCH_INPUT.offsetParent !== null) {
                    setTimeout(() => {
                        SEARCH_INPUT.value = last_search;
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
                    SEARCH_INPUT.value = last_search;
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
    } else if (_ACTION == 'undo' || _ACTION == 'redo' || _ACTION == 'redo (alternative)') {
        const AUTORIZED_PAGES = [
            'A++ IDE - Editor',
            'A++ IDE - Éditeur'
        ];
        if (!AUTORIZED_PAGES.includes(document.title)) return;
        if (_ACTION == 'redo' || _ACTION == 'redo (alternative)') redo();
        else if (_ACTION == 'undo') undo();
    } else {
        return;
    }

    const CODE_EDITOR = document.getElementById('code-editor');
    if (CODE_EDITOR) {
        const event = new Event('input', { bubbles: true });
        CODE_EDITOR.dispatchEvent(event);
    }
}