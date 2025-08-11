/*
    FIle        : script.js
    Version     : 1.0
    Description : Settings script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-27
    Last Update : 2025-08-11
*/
const {syntax_highlighting} = require('../../scripts/syntax_highlighting.js');

function animateValue(element, newValue) {
    element.textContent = newValue;
    element.classList.add('value-animate');
    setTimeout(() => {
        element.classList.remove('value-animate');
    }, 300);
}

document.getElementById("theme").addEventListener("change", (event) => {
    const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
    if (!fs.existsSync(DATA_PATH)) {
        console.error("The settings file does not exist :", DATA_PATH);
        return;
    }

    let settings = {};

    try {
        const DATA = fs.readFileSync(DATA_PATH, 'utf8');
        settings = JSON.parse(DATA);
    } catch (error) {
        console.error("Error reading or parsing JSON file :", error);
        return;
    }
    const SELECTED_THEME = event.target.value;
    document.getElementById("preview-area").style.background = settings.theme?.[SELECTED_THEME]?.editor?.[".textarea-background-color"];
    document.getElementById("preview-area").style.color = settings.theme?.[SELECTED_THEME]?.editor?.[".textarea-color"]
    animateValue(document.getElementById("theme-value"), SELECTED_THEME);
    updatePreview();
});

document.getElementById("font-size").addEventListener("change", (event) => {
    const SELECTED_FONT_SIZE = event.target.value;
    animateValue(document.getElementById("font-size-value"), SELECTED_FONT_SIZE);
    document.getElementById("code-editor").style.fontSize = `${SELECTED_FONT_SIZE}px`;
    updatePreview();
});

document.getElementById("font-family").addEventListener("change", (event) => {
    const SELECTED_FONT_FAMILY = event.target.value;
    document.getElementById("preview-text").style.fontFamily = SELECTED_FONT_FAMILY;
    animateValue(document.getElementById("font-family-value"), SELECTED_FONT_FAMILY);
    updatePreview();
});

document.getElementById("line-numbers").addEventListener("change", (event) => {
    updatePreview();
});

document.getElementById("tabulation-size").addEventListener("change", (event) => {
    const SELECTED_TABULATION_SIZE = event.target.value;
    animateValue(document.getElementById("tab-size-value"), SELECTED_TABULATION_SIZE);
    updatePreview();
});

document.getElementById("syntax-highlighting").addEventListener("change", (event) => {
    const SHOW_SUGGESTIONS = event.target.checked;
    animateValue(document.getElementById("syntax-highlighting"), SHOW_SUGGESTIONS ? "Enabled" : "Disabled");
    updatePreview();
});

window.addEventListener('DOMContentLoaded', () => {
    updatePreview();
    update_buttons();
});

function update_buttons() {
    try {
        const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
        const DATA = fs.readFileSync(DATA_PATH, 'utf8');
        const SETTINGS = JSON.parse(DATA).data_settings;

        const EL = (id) => document.getElementById(id);

        if (EL("theme")) EL("theme").value = SETTINGS.theme;
        if (EL("font-size")) {
            EL("font-size").value = SETTINGS["font-size"].size;
            const SIZE_VALUE = EL("font-size-value");
            if (SIZE_VALUE) SIZE_VALUE.textContent = SETTINGS["font-size"].size;
        }
        if (EL("font-family")) EL("font-family").value = SETTINGS["font-family"];
        if (EL("language")) EL("language").value = SETTINGS.language;
        if (EL("auto-save")) EL("auto-save").checked = SETTINGS["auto-save"];
        if (EL("tabulation-size")) {
            EL("tabulation-size").value = SETTINGS["tabulation-size"];
            const TAB_SIZE_VALUE = EL("tab-size-value");
            if (TAB_SIZE_VALUE) TAB_SIZE_VALUE.textContent = SETTINGS["tabulation-size"];
        }
        if (EL("autocomplete")) EL("autocomplete").checked = SETTINGS.autocomplete;
        if (EL("suggestions")) EL("suggestions").checked = SETTINGS["show-suggestions"];
        if (EL("syntax-highlighting")) EL("syntax-highlighting").checked = SETTINGS["syntax-highlighting"];
        if (EL("line-numbers")) EL("line-numbers").checked = SETTINGS["show-line-numbers"];

    } catch (error) {
        alert(error);
    }
}

function updatePreview() {
    const FONT_SIZE = document.getElementById("font-size").value;
    const FONT_FAMILY = document.getElementById("font-family").value;
    const TAB_SIZE = Number(document.getElementById("tabulation-size").value);
    const SHOW_LINE_NUMBERS = document.getElementById("line-numbers").checked;
    const THEME = document.getElementById("theme").value;
    const SYNTAX_HIGHLIGHTING = document.getElementById("syntax-highlighting").checked;

    const CODES_LINES =
        "// Ceci est un commentaire\n/*Ceci est un\n<&tab_char>commentaire multiligne */\n\nfn afficherMessage() {\n<&tab_char>const str message = \"HELLO, 'WORD' !\";\n<&tab_char>let int compteur = 0;\n<&tab_char>for (let int i = 0; i < 10; i++) {\n<&tab_char><&tab_char>if (i % 2 === 0) {\n<&tab_char><&tab_char><&tab_char>log(message + \" \" + i);\n<&tab_char><&tab_char>} else {\n<&tab_char><&tab_char><&tab_char>// Nombre impair\n<&tab_char><&tab_char><&tab_char><&tab_char>log(\"Impair : \" + i);\n<&tab_char><&tab_char>}\n<&tab_char>}\n}\n\nconst float pi = 3.14159;\ntry {\n<&tab_char>operation();\n} catch (e) {\n<&tab_char>log('Erreur : ' + e);\n} finally {\n<&tab_char>return;\n}";
    const TAB_CHAR = '\t';
    const TAB_DISPLAY = TAB_CHAR.repeat(TAB_SIZE);
    const LINES = CODES_LINES.split('\n');
    const LINES_REPLACED = LINES.map(line => line.split('<&tab_char>').join(" ".repeat(TAB_SIZE)));

    const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
    const DATA = fs.readFileSync(DATA_PATH, 'utf8');
    const SETTINGS = JSON.parse(DATA).theme;

    let html = '';
    if (SHOW_LINE_NUMBERS) {
        html += '<div style="display: flex; flex-direction: column; align-items: flex-start;">';
        for (let i = 0; i < LINES_REPLACED.length; i++) {
            let line = LINES_REPLACED[i].replace(/\t/g, TAB_DISPLAY);
            html += `<div style="display: flex; align-items: center;">
                <span class="line-number" style="user-select:none;min-width:32px;text-align:right;display:inline-block;margin-right:8px;">${i+1}</span>
                <span class="code-line">${line}</span>
            </div>`;
        }
        html += '</div>';
    } else {
        html += '<div style="display: flex; flex-direction: column; align-items: flex-start;">';
        for (let i = 0; i < LINES_REPLACED.length; i++) {
            let line = LINES_REPLACED[i].replace(/\t/g, TAB_DISPLAY);
            html += `<div style="display: flex; align-items: center;">
                <span class="code-line">${line}</span>
            </div>`;
        }
        html += '</div>';
    }
    const PREVIEW = document.getElementById("code-editor");
    PREVIEW.innerHTML = html;
    PREVIEW.style.fontSize = FONT_SIZE + 'px';
    PREVIEW.style.fontFamily = FONT_FAMILY;
    PREVIEW.classList.add("tab-preview");

    const PREVIEW_AREA = document.getElementById("preview-area");
    PREVIEW_AREA.style.backgroundColor = SETTINGS?.[THEME]?.editor?.['.textarea-background-color'];
    PREVIEW_AREA.style.color = SETTINGS?.[THEME]?.editor?.['.textarea-color'];

    if (SYNTAX_HIGHLIGHTING) {
        syntax_highlighting();
    }
}

function saveSettings(event) {
    const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
    if (event) event.preventDefault();
    const DATA_SETTINGS = {
        "theme": document.getElementById("theme").value,
        "font-size": {
            "size": Number(document.getElementById("font-size").value),
            "unit": "px"
        },
        "font-family": document.getElementById("font-family").value,
        "language": document.getElementById("language").value,
        "auto-save": document.getElementById("auto-save").checked,
        "tabulation-size": Number(document.getElementById("tabulation-size").value),
        "autocomplete": document.getElementById("autocomplete").checked,
        "show-suggestions": document.getElementById("suggestions").checked,
        "syntax-highlighting": document.getElementById("syntax-highlighting").checked,
        "show-line-numbers": document.getElementById("line-numbers").checked
    };
    try {
        let settings = {};
        if (fs.existsSync(DATA_PATH)) {
            const DATA = fs.readFileSync(DATA_PATH, 'utf8');
            settings = JSON.parse(DATA);
        } else {
            settings = {
                default_data_settings: DATA_SETTINGS,
                data_settings: DATA_SETTINGS
            };
        }
        settings.data_settings = DATA_SETTINGS;
        fs.writeFileSync(DATA_PATH, JSON.stringify(settings, null, 4), 'utf8');
        console.log("[INFO] Saved settings :", DATA_SETTINGS);
        alert("Settings saved successfully!");
        update_buttons();
    } catch (error) {
        console.error("[ERROR] Unable to read or write configuration file:", error);
        alert("Error saving settings: " + error.message);
    }
    update_theme();
}

function resetSettings(event) {
    const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');
    if (event) event.preventDefault();
    try {
        let settings = {};
        let default_settings = {};
        if (fs.existsSync(DATA_PATH)) {
            const DATA = fs.readFileSync(DATA_PATH, 'utf8');
            settings = JSON.parse(DATA);
            default_settings = settings.default_data_settings;
        } else {
            alert("No default settings found. Please save your settings first.");
            return;
        }
        settings.data_settings = default_settings;
        fs.writeFileSync(DATA_PATH, JSON.stringify(settings, null, 4), 'utf8');
        console.log("[INFO] Reset settings to default:", default_settings);
        alert("Settings reset to default successfully!");
        update_buttons();
        updatePreview();
    } catch (error) {
        console.error("[ERROR] Unable to reset settings:", error);
        alert("Error resetting settings: " + error.message);
    }
    update_theme();
}