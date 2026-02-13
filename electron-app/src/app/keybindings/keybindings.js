/*
  ==============================================================================
  File        : keybindings.js
  Version     : 1.0
  Description : JavaScript file to manage the keybindings in A++ IDE
  Author      : Arthur
  Created     : 2025-11-07
  Last Update : 2025-11-29
  ==============================================================================
*/
const { ipcRenderer } = require('electron');

let user_settings_keybindings = {};

document.addEventListener('DOMContentLoaded', () => {
    const t_body = document.getElementById('keybindings_body');
    if (!t_body) return;

    ipcRenderer.send('get-user-connected-information');
    ipcRenderer.on('received-connected-user-information', (event, _user_information) => {
        user_settings_keybindings = _user_information?.keybindings || {};
        const normalize_keybindings_list = normalize_keybindings(user_settings_keybindings);
        render_keybindings(t_body, normalize_keybindings_list);
    });

    setTimeout(() => {
        if (t_body.children.length === 0) {
           t_body.innerHTML = '<tr><td colspan="2">Loading shortcuts...</td></tr>';
        }
    }, 250);
});

function normalize_keybindings(_keybindings) {
    if (!_keybindings || typeof _keybindings !== 'object') return [];
    return Object.entries(_keybindings).map(([combo, action]) => ({
        action: action,
        combo: combo
    }));
}

function render_keybindings(_t_body, _keybindings_list) {
    _t_body.innerHTML = '';
    if (!Array.isArray(_keybindings_list) || _keybindings_list.length === 0) {
        _t_body.innerHTML = '<tr><td colspan="2">No shortcuts</td></tr>';
        return;
    }

    _keybindings_list.forEach(item => {
        _t_body.appendChild(create_keybinding_row(item));
    });
}

function create_keybinding_row(_item) {
    const TR = document.createElement('tr');

    const TD_ACTION = document.createElement('td');
    TD_ACTION.textContent = _item.action || 'Unknown';
    TR.appendChild(TD_ACTION);

    const TD_KEY = document.createElement('td');

    const CHIP = document.createElement('div');
    CHIP.className = 'key_chip';

    function render_chip_from_parts(parts) {
        CHIP.innerHTML = '';
        if (!parts || parts.length === 0) {
            const EMPTY = document.createElement('span');
            EMPTY.className = 'hint';
            EMPTY.textContent = '—';
            CHIP.appendChild(EMPTY);
            return;
        }
        parts.forEach(part => {
            const SPAN = document.createElement('span');
            SPAN.className = 'key';
            SPAN.textContent = part;
            CHIP.appendChild(SPAN);
        });
    }

    render_chip_from_parts(format_combo_parts(_item.combo));
    TD_KEY.appendChild(CHIP);

    const INPUT = document.createElement('input');
    INPUT.type = 'text';
    INPUT.value = _item.combo || '';
    INPUT.className = 'key_input';
    INPUT.style.display = 'none';
    INPUT.setAttribute('autocomplete', 'off');
    TD_KEY.appendChild(INPUT);

    let on_outside_mouse_down = null;
    let on_key_capture_down = null;

    function normalize_combo_from_parts(_parts) {
        return (_parts || []).map(part => String(part).trim().toLowerCase()).filter(Boolean).join('+');
    }

    function update_ui_from_combo_string(_combo_string) {
        render_chip_from_parts(format_combo_parts(_combo_string));
    }

    TD_KEY.addEventListener('click', () => {
        if (INPUT.style.display !== 'none') return;

        CHIP.style.display = 'none';
        INPUT.style.display = '';
        INPUT.focus();
        INPUT.select();

        on_key_capture_down = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            if (ev.key === 'Escape') {
                INPUT.value = _item.combo || '';
                update_ui_from_combo_string(INPUT.value);
                INPUT.blur();
                return;
            }

            if (ev.key === 'Enter') {
                INPUT.blur();
                return;
            }

            const parts = [];
            if (ev.ctrlKey) parts.push('control');
            if (ev.metaKey) parts.push('meta');
            if (ev.altKey) parts.push('alt');
            if (ev.shiftKey) parts.push('shift');

            let keyName = ev.key || '';
            if (keyName === ' ') keyName = 'space';
            const mapSpecial = {
                'escape': 'esc',
                'esc': 'esc',
                'backspace': 'backspace',
                'delete': 'delete',
                'del': 'delete',
                'tab': 'tab',
                'enter': 'enter',
                ' ': 'space',
                'spacebar': 'space',
                'arrowleft': 'left',
                'arrowright': 'right',
                'arrowup': 'up',
                'arrowdown': 'down',
            };
            const lower = keyName.toLowerCase();
            const isOnlyModifier = ['control','ctrl','meta','alt','altgraph','shift'].includes(lower);
            if (!isOnlyModifier) {
                const mapped = mapSpecial[lower] || lower;
                parts.push(mapped);
            }

            const combo = normalize_combo_from_parts(parts);
            INPUT.value = combo;
            update_ui_from_combo_string(combo);
        };

        document.addEventListener('keydown', on_key_capture_down, true);

        on_outside_mouse_down = (e) => {
            if (!TD_KEY.contains(e.target)) {
                INPUT.blur();
            }
        };

        document.addEventListener('mousedown', on_outside_mouse_down);
    });

    INPUT.addEventListener('blur', () => {
        if (on_key_capture_down) {
            document.removeEventListener('keydown', on_key_capture_down, true);
            on_key_capture_down = null;
        }
        if (on_outside_mouse_down) {
            document.removeEventListener('mousedown', on_outside_mouse_down);
            on_outside_mouse_down = null;
        }

        const NEW_VAL = String(INPUT.value || '').trim();
        INPUT.style.display = 'none';
        CHIP.style.display = '';
        render_chip_from_parts(format_combo_parts(NEW_VAL));
        
        if (typeof update_theme === 'function') {
            update_theme();
        }

        try {
            user_settings_keybindings = user_settings_keybindings || {};

            function canonicalizeCombo(combo) {
                if (!combo) return '';
                const REVERSE_MAP = {
                    'ctrl': 'control', 'control': 'control',
                    'cmd': 'meta', 'meta': 'meta', 'command': 'meta',
                    'altgr': 'altgraph', 'alt': 'alt', 'shift': 'shift',
                    'esc': 'esc', 'escape': 'esc',
                    'enter': 'enter', 'space': 'space', 'tab': 'tab',
                    'backspace': 'backspace', 'del': 'delete', 'delete': 'delete',
                    '^': 'dead'
                };
                const parts = parse_combo_tokens(String(combo));
                return parts.map(p => {
                    const low = String(p).trim().toLowerCase();
                    if (low === '+') return '+';
                    return REVERSE_MAP[low] || low;
                }).join('+');
            }

            let comboCandidate = NEW_VAL;
            if (!comboCandidate) {
                const PARTS = Array.from(CHIP.querySelectorAll('.key')).map(s => String(s.textContent || '').trim()).filter(Boolean);
                if (PARTS.length) {
                    comboCandidate = PARTS.join('+');
                }
            }
            const comboCanonical = canonicalizeCombo(comboCandidate);

            for (const k of Object.keys(user_settings_keybindings)) {
                if (user_settings_keybindings[k] === _item.action) {
                    delete user_settings_keybindings[k];
                }
            }
            if (comboCanonical) {
                user_settings_keybindings[comboCanonical] = _item.action;
            }

            if (ipcRenderer && ipcRenderer.send) {
                ipcRenderer.send('update-user-keybindings', user_settings_keybindings);
            }
        } catch (err) {
        }
    });

    INPUT.addEventListener('keydown', (k) => {
        if (k.key === 'Enter') INPUT.blur();
        if (k.key === 'Escape') {
            INPUT.value = _item.combo || '';
            INPUT.blur();
        }
    });

    TR.appendChild(TD_KEY);
    return TR;
}

function parse_combo_tokens(combo) {
    if (!combo || typeof combo !== 'string') return [];
    const tokens = [];
    let i = 0;
    while (i < combo.length) {
        const j = combo.indexOf('+', i);
        if (j === -1) {
            const tail = combo.slice(i);
            if (tail !== '') tokens.push(tail);
            break;
        }
        const before = combo.slice(i, j);
        if (j + 1 < combo.length && combo[j + 1] === '+') {
            if (before !== '') tokens.push(before);
            tokens.push('+');
            i = j + 2;
        } else {
            if (before !== '') tokens.push(before);
            i = j + 1;
        }
    }
    return tokens.map(t => String(t).trim()).filter(Boolean);
}

function format_combo_parts(_combo) {
    if (!_combo || typeof _combo !== 'string') return [];
    const MAP = {
        control : 'Ctrl',
        ctrl: 'Ctrl',
        meta: 'Cmd',
        command: 'Cmd',
        cmd: 'Cmd',
        alt: 'Alt',
        altgraph: 'AltGr',
        shift: 'Shift',
        enter: 'Enter',
        esc: 'Esc',
        escape: 'Esc',
        space: 'Space',
        tab: 'Tab',
        backspace: 'Backspace',
        delete: 'Del',
        del: 'Del',
        dead: '^',
        '+': '+'
    };

    const parts = parse_combo_tokens(_combo);

    return parts
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            const lower = part.toLowerCase();
            if (MAP[lower] !== undefined) return MAP[lower];
            if (lower.length === 1) {
                return part.toUpperCase();
            }
            if (/^f\d+$/i.test(part)) return part.toUpperCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .filter(Boolean);
}

function save_keybindings(_event) {
    if (_event) _event.preventDefault();
    let data_keybindings = {};
    const T_BODY = document.getElementById('keybindings_body');
    if (!T_BODY) return;

    const ROWS = Array.from(T_BODY.querySelectorAll('tr'));

    function canonicalizeCombo(comboRaw) {
        if (!comboRaw) return '';
        const REVERSE_MAP = {
            'ctrl': 'control', 'control': 'control',
            'cmd': 'meta', 'meta': 'meta', 'command': 'meta',
            'altgr': 'altgraph', 'alt': 'alt', 'shift': 'shift',
            'esc': 'esc', 'escape': 'esc',
            'enter': 'enter', 'space': 'space', 'tab': 'tab',
            'backspace': 'backspace', 'del': 'delete', 'delete': 'delete',
            '^': 'dead'
        };
        const parts = parse_combo_tokens(String(comboRaw));
        return parts.map(p => {
            const low = String(p).trim().toLowerCase();
            if (low === '+') return '+';
            return REVERSE_MAP[low] || low;
        }).join('+');
    }

    const conflicts = [];
    ROWS.forEach(row => {
        const ACTION_CELL = row.querySelector('td:first-child');
        const KEY_CELL = row.querySelector('td:last-child');
        if (!ACTION_CELL || !KEY_CELL) return;

        const ACTION = String(ACTION_CELL.textContent || '').trim();
        if (!ACTION) return;

        const INPUT = KEY_CELL.querySelector('input.key_input');
        let comboRaw = '';
        if (INPUT && String(INPUT.value || '').trim() !== '') {
            comboRaw = String(INPUT.value || '').trim();
        } else {
            const PARTS = Array.from(KEY_CELL.querySelectorAll('.key_chip .key'))
                                .map(span => String(span.textContent || '').trim())
                                .filter(Boolean);
            if (PARTS.length) {
                comboRaw = PARTS.join('+');
            }
        }

        const combo = canonicalizeCombo(comboRaw);
        if (!combo) return;

        if (data_keybindings[combo] && data_keybindings[combo] !== ACTION) {
            conflicts.push({ combo, existingAction: data_keybindings[combo], newAction: ACTION });
        } else {
            data_keybindings[combo] = ACTION;
        }
    });

    if (conflicts.length > 0) {
        const lines = conflicts.map(c => `${c.combo} → "${c.existingAction}" / "${c.newAction}"`);
        ipcRenderer.send('show-popup',
            'duplicate_shortcuts', 
            'duplicate_shortcuts_found:\n' + lines.join('\n'),
            'error',
            [],
            [{ label: 'close_button', action: null }],
            0
        );
        return;
    }

    ipcRenderer.send('save-keybindings-user-connected', data_keybindings);
    ipcRenderer.send('show-popup', 'settings_saved', 'preference_saved', 'success', [], [{ label: 'close_button', action: null }], 0);
}

function reset_keybindings(_event) {
    const DATA_PATH = path.resolve(__dirname, '../../data/keybindings.json');
    if (event) event.preventDefault();
    try {
        default_settings = {};
        if (fs.existsSync(DATA_PATH)) {
            const DATA = fs.readFileSync(DATA_PATH, 'utf8');
            default_data_keybindings = JSON.parse(DATA);
        } else {
            ipcRenderer.send('show-popup', 'default_settings_not_found', 'default_settings_not_found_message', 'warning', [], [{ label: "close_button", action: null }], 0);
            return;
        }
        ipcRenderer.send('save-keybindings-user-connected', default_data_keybindings);
        ipcRenderer.send('show-popup', 'settings_reset', 'settings_reset_message', 'success', [], [{ label: "close_button", action: null }], 0);
    } catch (error) {
        ipcRenderer.send('show-popup', 'reset_settings_failed', 'reset_settings_message_failed', 'error', [], [{ label: "close_button", action: null }], 0);
    }
}