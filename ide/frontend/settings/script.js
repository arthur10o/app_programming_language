const fs = require('fs');
const path = require('path');

document.addEventListener("DOMContentLoaded", () => {
    const SAVE_SETTINGS_BUTTON = document.getElementById("save-settings");
    const RESET_SETTINGS_BUTTON = document.getElementById("reset-settings");
    console.log("[DEBUG] DATA_PATH:", DATA_PATH);
});

function saveSettings(event) {
    const DATA_PATH = path.resolve(__dirname, '../data/data_settings.json');
    if (event) event.preventDefault();
    const data_settings = {
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
            const data = fs.readFileSync(DATA_PATH, 'utf8');
            settings = JSON.parse(data);
        } else {
            settings = {
                default_data_settings: data_settings,
                data_settings: data_settings
            };
        }
        settings.data_settings = data_settings;
        fs.writeFileSync(DATA_PATH, JSON.stringify(settings, null, 4), 'utf8');
        console.log("[INFO] Saved settings :", data_settings);
        alert("Settings saved successfully!");
    } catch (error) {
        console.error("[ERROR] Unable to read or write configuration file:", error);
        alert("Error saving settings: " + error.message);
    }
}

function resetSettings(event) {
    const DATA_PATH = path.resolve(__dirname, '../data/data_settings.json');
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