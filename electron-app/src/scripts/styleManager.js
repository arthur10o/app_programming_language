/*
    File        : styleManager.js
    Version     : 1.0
    Description : Style manager script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-07-26
*/
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '../../data/data_settings.json');

try {
    let settings = {};
    let current_settings = {};
    if (fs.existsSync(DATA_PATH)) {
        const DATA = fs.readFileSync(DATA_PATH, 'utf8');
        settings = JSON.parse(DATA);
        current_settings = settings.data_settings;
    }
    settings.data_settings = current_settings;
    document.body.style.fontFamily = current_settings["font-family"];
} catch (error) {
    console.error("[ERROR] Unable to reset settings:", error);
    alert("Error resetting settings: " + error.message);
}