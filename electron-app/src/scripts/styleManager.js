/*
    File        : styleManager.js
    Version     : 1.0
    Description : Style manager script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-10
*/
const fs = require('fs');
const path = require('path');

window.addEventListener('load', () => {
    update_theme();
});

function update_theme() {
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
    
    const CURRENT_THEME = settings.data_settings?.theme;
    if (!CURRENT_THEME) {
        alert("Theme not found in settings");
    }
                                    // Update common CSS
    document.body.style.background = settings.theme?.[CURRENT_THEME]?.common_css?.["body-background"];
    document.body.style.color = settings.theme?.[CURRENT_THEME]?.common_css?.["body-color"];
    const BUTTON = document.getElementsByClassName("button");
    for (let i = 0; i < BUTTON.length; i++) {
        BUTTON[i].style.color = settings.theme?.[CURRENT_THEME]?.common_css?.[".button-color"];
        BUTTON[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.common_css?.[".button-background-color"];
        BUTTON[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.common_css?.[".button-box-shadow"];
        BUTTON[i].addEventListener("mouseenter", () => {
            BUTTON[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.common_css?.[".button:hover-background-color"];
            BUTTON[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.common_css?.[".button:hover-box-shadow"];
        });
        BUTTON[i].addEventListener("mouseout", () => {
            BUTTON[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.common_css?.[".button-background-color"];
            BUTTON[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.common_css?.[".button-box-shadow"];
        });
        BUTTON[i].addEventListener('click', () => {
            BUTTON[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.common_css?.[".button:active-box-shadow"];
        });
    }

    const LINE_NUMBERS = document.getElementsByClassName("line-number");
    for (let i = 0; i < LINE_NUMBERS.length; i++) {
        LINE_NUMBERS[i].style.color = settings.theme?.[CURRENT_THEME]?.common_css?.[".line-number-color"];
    }

                                    // Update index CSS
    const h1_ELEMENT = document.getElementsByTagName("h1");
    for (let i = 0; i < h1_ELEMENT.length; i++) {
        h1_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.home?.["h1-color"];
        h1_ELEMENT[i].style.textShadow = settings.theme?.[CURRENT_THEME]?.home?.["h1-text-shadow"];
    }

    const p_ELEMENT = document.getElementsByTagName("p");
    for (let i = 0; i < p_ELEMENT.length; i++) {
        p_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.home?.["p-color"];
    }

    const footer_p_ELEMENT = document.getElementsByTagName("footer")/*.getElementsByTagName("p")*/;
    for (let i = 0; i < footer_p_ELEMENT.length; i++) {
        footer_p_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.home?.["footer-color"];
        footer_p_ELEMENT[i].getElementsByTagName("p")[i].style.color = settings.theme?.[CURRENT_THEME]?.home?.["footer-p-color"];
    }

                                    // Update console CSS
    const console_ELEMENT = document.getElementsByClassName('console');
    for (let i = 0; i < console_ELEMENT.length; i++) {
        console_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.console?.[".console-background-color"];
        console_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.console?.[".console-box-shadow"];
        console_ELEMENT[i].addEventListener('mouseenter', () => {
            console_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.console?.[".console:hover-box-shadow"];
        });
        console_ELEMENT[i].addEventListener('mouseout', () => {
            console_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.console?.[".console-box-shadow"];
        });
    }

                                    // Update editor CSS
    const editor_ELEMENT = document.getElementsByClassName('editor');
    for (let i = 0; i < editor_ELEMENT.length; i++) {
        editor_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.editor?.[".editor-background-color"];
        editor_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.editor?.[".editor-box-shadow"];
    }

    const textarea_ELEMENT = document.getElementsByClassName("textarea");
    for (let i = 0; i < textarea_ELEMENT.length; i++) {
        textarea_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea-background-color"];
        textarea_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea-color"];
        textarea_ELEMENT[i].addEventListener('focus', () => {
            textarea_ELEMENT[i].style.border = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea:focus-border"];
            textarea_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea:focus-box-shadow"];
        });
        // TODO : Ajouter quand textarea n'est plus focus (border et boxShadow)

    }
                                    // Update settings CSS
    const settings_ELEMENT = document.getElementsByClassName("settings");
    for (let i = 0; i < settings_ELEMENT.length; i++) {
        settings_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.settings?.[".settings-background-color"];
        settings_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.settings?.[".settings-box-shadow"];
    }

    const fieldset_ELEMENT = document.getElementsByTagName('fieldset');
    for (let i = 0; i < fieldset_ELEMENT.length; i++) {
        fieldset_ELEMENT[i].style.border = settings.theme?.[CURRENT_THEME]?.settings?.["fieldset-border"];
        fieldset_ELEMENT[i].style.background = settings.theme?.[CURRENT_THEME]?.settings?.["fieldset-background"];
        fieldset_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.settings?.["fieldset-box-shadow"];
    }

    const legend_ELEMENT = document.getElementsByTagName('legend');
    for (let i = 0; i < legend_ELEMENT.length; i++) {
        legend_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["legend-color"]
    }

    document.getElementById('preview-area').style.boxShadow = settings.theme?.[CURRENT_THEME]?.settings?.["#preview-area-box-shadow"];
    document.getElementById('preview-area').style.border = settings.theme?.[CURRENT_THEME]?.settings?.["#preview--border"];
    document.getElementById('preview-area').style.background = settings.theme?.[CURRENT_THEME]?.settings?.["#preview-area-background"];
    document.getElementById('preview-area').style.color = settings.theme?.[CURRENT_THEME]?.settings?.["#preview-area-color"];

    const label_ELEMENT = document.getElementsByTagName('label');
    for (let i = 0; i < label_ELEMENT.length; i++) {
        label_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["label-color"];
    }

    const select_ELEMENT = document.getElementsByTagName('select');
    for (let i = 0; i < select_ELEMENT.length; i++) {
        select_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["select-input[type='range']-input[type='checkbox']-background-color"];
        select_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.settings?.["select-input[type='range']-input[type='checkbox']-color"];
    }
    const input_ELEMENT = document.getElementsByTagName('input');
    for (let i = 0; i < input_ELEMENT.length; i++) {
        if (input_ELEMENT[i].type == 'range' || input_ELEMENT[i].type == "checkbox") {
            input_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["select-input[type='range']-input[type='checkbox']-background-color"];
            input_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.settings?.["select-input[type='range']-input[type='checkbox']-color"];
        }
    }
}

module.exports = { update_theme };