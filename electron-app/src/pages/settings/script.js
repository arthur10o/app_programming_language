const fs = require('fs');
const path = require('path');

function animateValue(element, newValue) {
    element.textContent = newValue;
    element.classList.add('value-animate');
    setTimeout(() => {
        element.classList.remove('value-animate');
    }, 300);
}

document.getElementById("theme").addEventListener("change", (event) => {
    const SELECTED_THEME = event.target.value;
    document.getElementById("preview-area").style.backgroundColor = SELECTED_THEME === 'dark' ? '#222' : '#fff';
    document.getElementById("preview-area").style.color = SELECTED_THEME === 'dark' ? '#fff' : '#222';
    animateValue(document.getElementById("theme-value"), SELECTED_THEME);
    updatePreview();
});

document.getElementById("font-size").addEventListener("change", (event) => {
    const SELECTED_FONT_SIZE = event.target.value;
    animateValue(document.getElementById("font-size-value"), SELECTED_FONT_SIZE);
    document.getElementById("preview-text").style.fontSize = `${SELECTED_FONT_SIZE}px`;
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

document.addEventListener("DOMContentLoaded", () => {
    const SAVE_SETTINGS_BUTTON = document.getElementById("save-settings");
    const RESET_SETTINGS_BUTTON = document.getElementById("reset-settings");
    console.log("[DEBUG] DATA_PATH:", DATA_PATH);
    updatePreview();
});

window.addEventListener('DOMContentLoaded', () => {
  updatePreview();
});


function updatePreview() {
    const fontSize = document.getElementById("font-size").value;
    const fontFamily = document.getElementById("font-family").value;
    const tabSize = Number(document.getElementById("tabulation-size").value);
    const showLineNumbers = document.getElementById("line-numbers").checked;
    const theme = document.getElementById("theme").value;

    const codeLines = [
        'function helloWorld() {',
        '\tconsole.log("Hello, world!");',
        '}',
        '',
        'helloWorld();'
    ];

    const tabChar = '\t';
    const tabDisplay = tabChar.repeat(tabSize);
    let html = '';
    for (let i = 0; i < codeLines.length; i++) {
        let line = codeLines[i].replace(/\t/g, tabDisplay);
        if (showLineNumbers) {
            html += `<span class="line-number" style="color:#888;user-select:none;">${i+1}</span> `;
        }
        html += `<span class="code-line">${line}</span>\n`;
    }
    const preview = document.getElementById("preview-text");
    preview.innerHTML = html;
    preview.style.fontSize = fontSize + 'px';
    preview.style.fontFamily = fontFamily;
    preview.classList.add("tab-preview");

    const previewArea = document.getElementById("preview-area");
    previewArea.style.backgroundColor = theme === 'dark' ? '#222' : '#fff';
    previewArea.style.color = theme === 'dark' ? '#fff' : '#222';
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
    } catch (error) {
        console.error("[ERROR] Unable to read or write configuration file:", error);
        alert("Error saving settings: " + error.message);
    }
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
    } catch (error) {
        console.error("[ERROR] Unable to reset settings:", error);
        alert("Error resetting settings: " + error.message);
    }
}