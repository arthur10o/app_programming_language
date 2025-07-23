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
        console.log("[INFO] Paramètres enregistrés :", data_settings);
        alert("Paramètres enregistrés avec succès !");
    } catch (error) {
        console.error("[ERROR] Impossible de lire ou écrire le fichier de configuration:", error);
        alert("Erreur lors de la sauvegarde des paramètres : " + error.message);
    }
}