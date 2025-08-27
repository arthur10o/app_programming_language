/*
  ==============================================================================
  File        : settings.js
  Version     : 1.0
  Description : JavaScript file to manage the settings in A++ IDE
  Author      : Arthur
  Created     : 2025-07-27
  Last Update : 2025-08-28
  ==============================================================================
*/
const {syntax_highlighting} = require('../../common/syntaxHighlighting.js');
const { ipcRenderer } = require('electron');

let settings = {};
ipcRenderer.send('get-user-connected-information');
ipcRenderer.on('received-connected-user-information', (event, _user_information) => {
    if (!_user_information) {
        const DATA_PATH = path.resolve(__dirname, '../../data/settings.json');
        if (!fs.existsSync(DATA_PATH)) {
            ipcRenderer.send('show-popup', 'Settings File Missing', 'The user settings file could not be found. Please ensure the application is properly installed or try restarting it.', 'error', [], [{ label: "Close", action: null }], 0);
            return;
        }

        try {
            const DATA = fs.readFileSync(DATA_PATH, 'utf8');
            settings = JSON.parse(DATA).data_settings || JSON.parse(DATA);
        } catch (error) {
            ipcRenderer.send('show-popup', 'Settings Load Error', 'Unable to load the user settings file. Please ensure the application is properly installed or try restarting it.', 'error', [], [{ label: "Close", action: null }], 0);
            return;
        }
    } else {
        const prefs = _user_information.preferences;
        settings = {
            "theme": prefs.theme,
            "fontSize": prefs.fontSize,
            "fontFamily": prefs.fontFamily,
            "language": prefs.language,
            "autoSave": prefs.autoSave,
            "tabSize": prefs.tabSize,
            "autocomplete": prefs.autocomplete,
            "showSuggestions": prefs.showSuggestions,
            "syntaxHighlighting": prefs.syntaxHighlighting,
            "showLineNumbers": prefs.showLineNumbers
        };
    }
    update_buttons();
    updatePreview();
});

function animateValue(_element, _newValue) {
    _element.textContent = _newValue;
    _element.classList.add('value-animate');
    setTimeout(() => {
        _element.classList.remove('value-animate');
    }, 300);
}

document.getElementById('theme').addEventListener('change', (event) => {
    const SELECTED_THEME = event.target.value;
    document.getElementById('preview-area').style.background = settings.theme?.[SELECTED_THEME]?.editor?.['.textarea-background-color'];
    document.getElementById('preview-area').style.color = settings.theme?.[SELECTED_THEME]?.editor?.['.textarea-color']
    animateValue(document.getElementById('theme-value'), SELECTED_THEME);
    updatePreview();
});

document.getElementById('font-size').addEventListener('change', (event) => {
    const SELECTED_FONT_SIZE = event.target.value;
    animateValue(document.getElementById('font-size-value'), SELECTED_FONT_SIZE);
    document.getElementById('code-editor').style.fontSize = `${SELECTED_FONT_SIZE}px`;
    updatePreview();
});

document.getElementById('font-family').addEventListener('change', (event) => {
    const SELECTED_FONT_FAMILY = event.target.value;
    document.getElementById('preview-text').style.fontFamily = SELECTED_FONT_FAMILY;
    animateValue(document.getElementById('font-family-value'), SELECTED_FONT_FAMILY);
    updatePreview();
});

document.getElementById('line-numbers').addEventListener('change', (event) => {
    updatePreview();
});

document.getElementById('tabulation-size').addEventListener('change', (event) => {
    const SELECTED_TABULATION_SIZE = event.target.value;
    animateValue(document.getElementById('tab-size-value'), SELECTED_TABULATION_SIZE);
    updatePreview();
});

document.getElementById('syntax-highlighting').addEventListener('change', (event) => {
    const SHOW_SUGGESTIONS = event.target.checked;
    animateValue(document.getElementById('syntax-highlighting'), SHOW_SUGGESTIONS ? 'Enabled' : 'Disabled');
    updatePreview();
});

window.addEventListener('DOMContentLoaded', () => {
    updatePreview();
    update_buttons();
});

function update_buttons() {
    try {
        const EL = (id) => document.getElementById(id);

        if (EL('theme')) EL('theme').value = settings.theme;
        if (EL('font-size')) {
            EL('font-size').value = settings.fontSize.size;
            const SIZE_VALUE = EL('font-size-value');
            if (SIZE_VALUE) SIZE_VALUE.textContent = settings.fontSize.size;
        }
        if (EL('font-family')) EL('font-family').value = settings.fontFamily;
        if (EL('language')) EL('language').value = settings.language;
        if (EL('auto-save')) EL('auto-save').checked = settings.autoSave;
        if (EL('tabulation-size')) {
            EL('tabulation-size').value = settings.tabSize;
            const TAB_SIZE_VALUE = EL('tab-size-value');
            if (TAB_SIZE_VALUE) TAB_SIZE_VALUE.textContent = settings.tabSize;
        }
        if (EL('autocomplete')) EL('autocomplete').checked = settings.autocomplete;
        if (EL('suggestions')) EL('suggestions').checked = settings.showSuggestions;
        if (EL('syntax-highlighting')) EL('syntax-highlighting').checked = settings.syntaxHighlighting;
        if (EL('line-numbers')) EL('line-numbers').checked = settings.showLineNumbers;

    } catch (error) {
        ipcRenderer.send('show-popup', 'Settings Load Error', 'An error occurred while loading editor settings. Please ensure the settings file is accessible and properly formatted.', 'error', [], [{ label: "Close", action: null }], 0 );
    }
}

function updatePreview() {
    const FONT_SIZE = document.getElementById('font-size').value;
    const FONT_FAMILY = document.getElementById('font-family').value;
    const TAB_SIZE = Number(document.getElementById('tabulation-size').value);
    const SHOW_LINE_NUMBERS = document.getElementById('line-numbers').checked;
    const THEME = document.getElementById('theme').value;
    const SYNTAX_HIGHLIGHTING = document.getElementById('syntax-highlighting').checked;

    const CODES_LINES =
        '// Ceci est un commentaire\n/*Ceci est un\n<&tab_char>commentaire multiligne */\n\nfn afficherMessage() {\n<&tab_char>const str message = \'HELLO, "WORD" !\';\n<&tab_char>let int compteur = 0;\n<&tab_char>for (let int i = 0; i < 10; i++) {\n<&tab_char><&tab_char>if (i % 2 === 0) {\n<&tab_char><&tab_char><&tab_char>log(message + \' \' + i);\n<&tab_char><&tab_char>} else {\n<&tab_char><&tab_char><&tab_char>// Nombre impair\n<&tab_char><&tab_char><&tab_char><&tab_char>log(\'Impair : \' + i);\n<&tab_char><&tab_char>}\n<&tab_char>}\n}\n\nconst float pi = 3.14159;\ntry {\n<&tab_char>operation();\n} catch (e) {\n<&tab_char>log("Erreur : " + e);\n} finally {\n<&tab_char>return;\n}';
    const TAB_CHAR = '\t';
    const TAB_DISPLAY = TAB_CHAR.repeat(TAB_SIZE);
    const LINES = CODES_LINES.split('\n');
    const LINES_REPLACED = LINES.map(line => line.split('<&tab_char>').join(' '.repeat(TAB_SIZE)));

    let html = '';
    if (SHOW_LINE_NUMBERS) {
        html += '<div style="display: flex; flex-direction: column; align-items: flex-start;">';
        for (let i = 0; i < LINES_REPLACED.length; i++) {
            let line = LINES_REPLACED[i].replace(/\t/g, TAB_DISPLAY);
            html += `<div style='display: flex; align-items: center;'>
                <span class='line-number' style='user-select:none;min-width:32px;text-align:right;display:inline-block;margin-right:8px;'>${i+1}</span>
                <span class='code-line'>${line}</span>
            </div>`;
        }
        html += '</div>';
    } else {
        html += '<div style="display: flex; flex-direction: column; align-items: flex-start;">';
        for (let i = 0; i < LINES_REPLACED.length; i++) {
            let line = LINES_REPLACED[i].replace(/\t/g, TAB_DISPLAY);
            html += `<div style='display: flex; align-items: center;'>
                <span class='code-line'>${line}</span>
            </div>`;
        }
        html += '</div>';
    }
    const PREVIEW = document.getElementById('code-editor');
    PREVIEW.innerHTML = html;
    PREVIEW.style.fontSize = FONT_SIZE + 'px';
    PREVIEW.style.fontFamily = FONT_FAMILY;
    PREVIEW.classList.add('tab-preview');

    const PREVIEW_AREA = document.getElementById('preview-area');
    PREVIEW_AREA.style.backgroundColor = settings?.[THEME]?.editor?.['.textarea-background-color'];
    PREVIEW_AREA.style.color = settings?.[THEME]?.editor?.['.textarea-color'];

    if (SYNTAX_HIGHLIGHTING) {
        syntax_highlighting();
    }
}

function saveSettings(event) {
    if (event) event.preventDefault();
    const DATA_SETTINGS = {
        'theme': document.getElementById('theme').value,
        'fontSize': {
            'size': Number(document.getElementById('font-size').value),
            'unit': 'px'
        },
        'fontFamily': document.getElementById('font-family').value,
        'language': document.getElementById('language').value,
        'autoSave': document.getElementById('auto-save').checked,
        'tabSize': Number(document.getElementById('tabulation-size').value),
        'autocomplete': document.getElementById('autocomplete').checked,
        'showSuggestions': document.getElementById('suggestions').checked,
        'syntaxHighlighting': document.getElementById('syntax-highlighting').checked,
        'showLineNumbers': document.getElementById('line-numbers').checked
    }
    try {
        ipcRenderer.send('save-settings-user-connected', DATA_SETTINGS);
        ipcRenderer.send('show-popup', 'Settings Saved', 'Your preferences have been successfully saved.', 'success', [], [{ label: "Close", action: null }], 0);
        update_buttons();
    } catch (error) {
        ipcRenderer.send('show-popup', 'Settings Save Error', 'An error occurred while saving your preferences. Please try again.', 'error', [], [{ label: "Close", action: null }], 0);
    }
    update_theme();
}

function resetSettings(event) {
    const DATA_PATH = path.resolve(__dirname, '../../data/settings.json');
    if (event) event.preventDefault();
    try {
        default_settings = {};
        if (fs.existsSync(DATA_PATH)) {
            const DATA = fs.readFileSync(DATA_PATH, 'utf8');
            default_settings = JSON.parse(DATA).default_data_settings;
        } else {
            ipcRenderer.send('show-popup', 'Default Settings Not Found', 'Unable to locate default settings. Please save your current preferences before attempting a reset.', 'warning', [], [{ label: "Close", action: null }], 0);
            return;
        }
        Object.assign(settings, default_settings);
        ipcRenderer.send('save-settings-user-connected', settings);
        ipcRenderer.send('show-popup', 'Settings Reset', 'Your settings have been successfully reset to default.', 'success', [], [{ label: "Close", action: null }], 0);
        update_buttons();
        updatePreview();
    } catch (error) {
        ipcRenderer.send('show-popup', 'Reset Failed', 'An error occurred while resetting your settings. Please try again.', 'error', [], [{ label: "Close", action: null }], 0);
    }
    update_theme();
}