/*
    File        : styleManager.js
    Version     : 1.0
    Description : Style manager script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-08-11
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

    document.getElementById('code-editor').style.fontSize = settings.data_settings?.['font-size'].size + settings.data_settings?.['font-size'].unit;
    document.getElementById('code-editor').style.fontFamily = settings.data_settings?.['font-family'];

    const textarea_ELEMENT = document.getElementsByClassName("textarea");
    for (let i = 0; i < textarea_ELEMENT.length; i++) {
        textarea_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea-background-color"];
        textarea_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea-color"];
        textarea_ELEMENT[i].addEventListener('focus', () => {
            textarea_ELEMENT[i].style.border = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea:focus-border"];
            textarea_ELEMENT[i].style.boxShadow = settings.theme?.[CURRENT_THEME]?.editor?.[".textarea:focus-box-shadow"];
        });
        textarea_ELEMENT[i].addEventListener('blur', () => {
            textarea_ELEMENT[i].style.border = '';
            textarea_ELEMENT[i].style.boxShadow = '';
        });
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

    const preview_area_ELEMENT = document.getElementById('preview-area');
    if (preview_area_ELEMENT) {
        preview_area_ELEMENT.style.boxShadow = settings.theme?.[CURRENT_THEME]?.settings?.["preview-area-box-shadow"];
        preview_area_ELEMENT.style.border = settings.theme?.[CURRENT_THEME]?.settings?.["preview--border"];
        preview_area_ELEMENT.style.background = settings.theme?.[CURRENT_THEME]?.settings?.["preview-area-background"];
        preview_area_ELEMENT.style.color = settings.theme?.[CURRENT_THEME]?.settings?.["preview-area-color"];
    }

    const label_ELEMENT = document.getElementsByTagName('label');
    for (let i = 0; i < label_ELEMENT.length; i++) {
        label_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["label-color"];
    }

    const select_ELEMENT = document.getElementsByTagName('select');
    for (let i = 0; i < select_ELEMENT.length; i++) {
        select_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.settings?.["select-input-background-color"];
        select_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["select-input-color"];
    }
    
    const input_ELEMENT = document.getElementsByTagName('input');
    for (let i = 0; i < input_ELEMENT.length; i++) {
        if (input_ELEMENT[i].type == 'range' || input_ELEMENT[i].type == "checkbox") {
            input_ELEMENT[i].style.backgroundColor = settings.theme?.[CURRENT_THEME]?.settings?.["select-input-background-color"];
            input_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.["select-input-color"];
        }
    }

    const value_animate_ELEMENT = document.getElementsByClassName("value-animate");
    for (let i = 0; i < value_animate_ELEMENT.length; i++) {
        value_animate_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.settings?.[".value-animate-color"];
    }

                                    // Update syntax highlighting CSS
    const comment_ELEMENT = document.getElementsByClassName('hl-comment');
    for (let i = 0; i < comment_ELEMENT.length; i++) {
        comment_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-comment']?.["color"];
        comment_ELEMENT[i].style.fontStyle = settings.theme?.[CURRENT_THEME]?.['.hl-comment']?.["font-style"];
    }

    const keyword_ELEMENT = document.getElementsByClassName("hl-keyword");
    for (let i = 0; i < keyword_ELEMENT.length; i++) {
        keyword_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-keyword']?.["color"];
        keyword_ELEMENT[i].style.fontWeight = settings.theme?.[CURRENT_THEME]?.['.hl-keyword']?.["font-weight"];
    }

    const native_type_ELEMENT = document.getElementsByClassName('hl-native-type');
    for (let i = 0; i < native_type_ELEMENT.length; i++) {
        native_type_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-native-type']?.["color"];
    }

    const literal_ELEMENT = document.getElementsByClassName("hl-literal");
    for (let i = 0; i < literal_ELEMENT.length; i++) {
        literal_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-literal']?.["color"];
    }

    const function_method_ELEMENT = document.getElementsByClassName('hl-function-method');
    for (let i = 0; i < function_method_ELEMENT.length; i++) {
        function_method_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-function-method']?.["color"];
    }

    const function_call_ELEMENT = document.getElementsByClassName('hl-function-call');
    for (let i = 0; i < function_call_ELEMENT.length; i++) {
        function_call_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-function-call']?.["color"];
    }

    const variable_ELEMENT = document.getElementsByClassName('hl-variable');
    for (let i = 0; i < variable_ELEMENT.length; i++) {
        variable_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-variable']?.["color"];
    }

    const constant_ELEMENT = document.getElementsByClassName('hl-constant');
    for (let i = 0; i < constant_ELEMENT.length; i++) {
        constant_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-constant']?.["color"];
    }

    const string_ELEMENT = document.getElementsByClassName("hl-string");
    for (let i = 0; i < string_ELEMENT.length; i++) {
        string_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-string']?.["color"];
    }

    const import_ELEMENT = document.getElementsByClassName('hl-import');
    for (let i = 0; i < import_ELEMENT.length; i++) {
        import_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-import']?.['color'];
    }

    const control_structure_ELEMENT = document.getElementsByClassName('hl-control-structure');
    for (let i = 0; i < control_structure_ELEMENT.length; i++) {
        control_structure_ELEMENT[i].style.color = settings.theme?.[CURRENT_THEME]?.['.hl-control-structure']?.['color'];
    }
}

module.exports = { update_theme };