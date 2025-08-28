/*
  ==============================================================================
  File        : styleManager.js
  Version     : 1.0
  Description : JavaScript file to manage the styles in A++ IDE
                - Functionality to update styles based on user settings
  Author      : Arthur
  Created     : 2025-07-26
  Last Update : 2025-08-28
  ==============================================================================
*/
const fs = require('fs');
const path = require('path');

window.addEventListener('load', () => {
    update_theme();
});

function update_theme() {
    const DATA_PATH = path.resolve(__dirname, '../../data/settings.json');

    if (!fs.existsSync(DATA_PATH)) {
        ipcRenderer.send('show-popup', 'Settings Load Error', `The settings file does not exist at:\n${DATA_PATH}`, 'error', [], [{ label: "Close", action: null }], 0);
        return;
    }

    let user_settings

    ipcRenderer.send('get-user-connected-information');
    ipcRenderer.on('received-connected-user-information', (event, _user_information) => {
        user_settings = _user_information;

        let settings = {};

        try {
            const DATA = fs.readFileSync(DATA_PATH, 'utf8');
            settings = JSON.parse(DATA);
        } catch (error) {
            ipcRenderer.send('show-popup', 'Settings Load Error', 'An error occurred while reading or parsing the settings file.\n\n' + 'This may be due to invalid JSON format.\n\n' + `Error message:\n${error.message}`, 'error', [], [{ label: "Close", action: null }], 0);
            return;
        }

        let current_theme = user_settings?.preferences?.['theme'] || 'dark';
        let font_size_size = user_settings?.preferences?.fontSize?.['size'];
        let font_size_unit = user_settings?.preferences?.fontSize?.['unit'];
        let font_family = user_settings?.preferences?.['fontFamily'];
        
        if (!current_theme) {
            ipcRenderer.send('show-popup', 'Theme Load Error', `The theme setting could not be found in your configuration file.\n\nPlease check your settings or reset them to default`, 'error', [], [{ label: "Close", action: null }], 0);
        }

                                        // Update common CSS
        document.body.style.background = settings.theme?.[current_theme]?.common_css?.['body-background'];
        document.body.style.color = settings.theme?.[current_theme]?.common_css?.['body-color'];
        const BUTTON = document.getElementsByClassName('button');
        for (let i = 0; i < BUTTON.length; i++) {
            BUTTON[i].style.color = settings.theme?.[current_theme]?.common_css?.['.button-color'];
            BUTTON[i].style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.button-background-color'];
            BUTTON[i].style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.button-box-shadow'];
            BUTTON[i].addEventListener('mouseenter', () => {
                BUTTON[i].style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.button:hover-background-color'];
                BUTTON[i].style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.button:hover-box-shadow'];
            });
            BUTTON[i].addEventListener('mouseout', () => {
                BUTTON[i].style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.button-background-color'];
                BUTTON[i].style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.button-box-shadow'];
            });
            BUTTON[i].addEventListener('click', () => {
                BUTTON[i].style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.button:active-box-shadow'];
            });
        }

        const LINE_NUMBERS = document.getElementsByClassName('line-number');
        for (let i = 0; i < LINE_NUMBERS.length; i++) {
            LINE_NUMBERS[i].style.color = settings.theme?.[current_theme]?.common_css?.['.line-number-color'];
        }

        const a_ELEMENT = document.getElementsByTagName('a');
        for (let i = 0; i < a_ELEMENT.length; i++) {
            a_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['hyperlinks-color'];
            a_ELEMENT[i].addEventListener('mouseenter', () => {
                a_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['hyperlinks-hover-color'];
            });
            a_ELEMENT[i].addEventListener('mouseout', () => {
                a_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['hyperlinks-color'];
            });
        }

        const html_ELEMENT = document.documentElement;
        html_ELEMENT.style.fontSize = `${font_size_size}${font_size_unit}`;

        document.body.style.fontFamily = font_family;

                                        // Update login/signup css
        if (document.title == 'A++ IDE - Sign Up' || document.title == 'A++ IDE - Login') {
            const login_container_ELEMENT = document.getElementsByClassName('login-container');
            for (let i = 0; i < login_container_ELEMENT.length; i++) {
                login_container_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.['.login-container-background-color'];
                login_container_ELEMENT[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.login-container-color'];

                const h1 = login_container_ELEMENT[i].querySelector('h1');
                if (h1) {
                    h1.style.color = settings.theme?.[current_theme]?.login_signup?.['.login-container-h1-color'];
                }
            }

            const input_group_ELEMENT = document.getElementsByClassName('input-group');
            for (let i = 0; i < input_group_ELEMENT.length; i++) {
                const label_ELEMENT = input_group_ELEMENT[i].getElementsByTagName('label');
                for (let j = 0; j < label_ELEMENT.length; j++) {
                    label_ELEMENT[j].style.color = settings.theme?.[current_theme]?.login_signup?.[".input-group label-color"];
                }

                const input_ELEMENT = input_group_ELEMENT[i].getElementsByTagName('input');
                for (let k = 0; k < input_ELEMENT.length; k++) {
                    const input_ELEMENT_k = input_ELEMENT[k];

                    if (input_ELEMENT_k.type === 'email') {
                        input_ELEMENT_k.style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='email']-background-color"];
                        input_ELEMENT_k.style.color = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='email']-color"];
                        input_ELEMENT_k.addEventListener('focus', () => {
                            input_ELEMENT_k.style.border = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='email']:focus-border"];
                            input_ELEMENT_k.style.boxShadow = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='email']:focus-box-shadow"];
                        });
                        input_ELEMENT_k.addEventListener('blur', () => {
                            input_ELEMENT_k.style.border = '';
                            input_ELEMENT_k.style.boxShadow = '';
                        });
                    }

                    if (input_ELEMENT_k.type === 'password') {
                        input_ELEMENT_k.style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='password']-background-color"];
                        input_ELEMENT_k.style.color = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='password']-color"];
                        input_ELEMENT_k.addEventListener('focus', () => {
                            input_ELEMENT_k.style.border = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='password']:focus-border"];
                            input_ELEMENT_k.style.boxShadow = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='password']:focus-box-shadow"];
                        });
                        input_ELEMENT_k.addEventListener('blur', () => {
                            input_ELEMENT_k.style.border = '';
                            input_ELEMENT_k.style.boxShadow = '';
                        });
                    }

                    if (input_ELEMENT_k.type === 'text') {
                        input_ELEMENT_k.style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='text']-background-color"];
                        input_ELEMENT_k.style.color = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='text']-color"];
                        input_ELEMENT_k.addEventListener('focus', () => {
                            input_ELEMENT_k.style.border = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='text']:focus-border"];
                            input_ELEMENT_k.style.boxShadow = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='text']:focus-box-shadow"];
                        });
                        input_ELEMENT_k.addEventListener('blur', () => {
                            input_ELEMENT_k.style.border = '';
                            input_ELEMENT_k.style.boxShadow = '';
                        });
                    }

                    if (input_ELEMENT_k.type === 'checkbox') {
                        input_ELEMENT_k.style.accentColor = settings.theme?.[current_theme]?.login_signup?.[".input-group input[type='checkbox']-accent-color"];
                    }
                }
            }

            const login_button_ELEMENT = document.querySelector("button[type='submit']");
            if (login_button_ELEMENT) {
                login_button_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.["button[type='submit']-background-color"];
                login_button_ELEMENT.style.color = settings.theme?.[current_theme]?.login_signup?.["button[type='submit']-color"];

                login_button_ELEMENT.addEventListener('mouseenter', () => {
                    login_button_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.["button[type='submit']:hover-background-color"];
                });
                login_button_ELEMENT.addEventListener('mouseout', () => {
                    login_button_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.["button[type='submit']-background-color"];
                });
            }

            const forgot_password_ELEMENT = document.getElementsByClassName('forgot-password');
            for (let i = 0; i < forgot_password_ELEMENT.length; i++) {
                const forgot_password_ELEMENT_i = forgot_password_ELEMENT[i];
                forgot_password_ELEMENT_i.style.color = settings.theme?.[current_theme]?.login_signup?.[".forgot-password-color"];
                forgot_password_ELEMENT_i.addEventListener('mouseenter', () => {
                    forgot_password_ELEMENT_i.style.color = settings.theme?.[current_theme]?.login_signup?.[".forgot-password:hover-color"];
                });
                forgot_password_ELEMENT_i.addEventListener('mouseout', () => {
                    forgot_password_ELEMENT_i.style.color = settings.theme?.[current_theme]?.login_signup?.[".forgot-password-color"];
                });
            }

            const toggle_password_ELEMENT = document.getElementById('toggle-password-id');
            const THEME_COLOR = settings.theme?.[current_theme]?.login_signup;
            const BASE_COLOR = THEME_COLOR?.[".toggle-password-color"];
            const HOVER_COLOR = THEME_COLOR?.[".toggle-password-color:hover"];

            if (toggle_password_ELEMENT && BASE_COLOR) {
                toggle_password_ELEMENT.style.color = BASE_COLOR;
                toggle_password_ELEMENT.addEventListener('mouseenter', () => {
                    toggle_password_ELEMENT.style.color = HOVER_COLOR || BASE_COLOR;
                });
                toggle_password_ELEMENT.addEventListener('mouseleave', () => {
                    toggle_password_ELEMENT.style.color = BASE_COLOR;
                });
            }

            const toggle_confirm_password_ELEMENT = document.getElementById('toggle-confirm-password-id');

            if (toggle_confirm_password_ELEMENT && BASE_COLOR) {
                toggle_confirm_password_ELEMENT.style.color = BASE_COLOR;
                toggle_confirm_password_ELEMENT.addEventListener('mouseenter', () => {
                    toggle_confirm_password_ELEMENT.style.color = HOVER_COLOR || BASE_COLOR;
                });
                toggle_confirm_password_ELEMENT.addEventListener('mouseleave', () => {
                    toggle_password_ELEMENT.style.color = BASE_COLOR;
                });
            }

            const error_message_ELEMENT = document.getElementsByClassName('error-message');
            for (let i = 0; i < error_message_ELEMENT.length; i++) {
                error_message_ELEMENT[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.error-message-color'];
                error_message_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.login_signup?.['.error-message-background-color'];
                error_message_ELEMENT[i].style.borderLeft = settings.theme?.[current_theme]?.login_signup?.['.error-message-border-left'];
            }

            const error_icon_ELEMENT = document.getElementsByClassName('error-icon');
            for (let i = 0; i < error_icon_ELEMENT.length; i++) {
                error_icon_ELEMENT[i].style.fill = settings.theme?.[current_theme]?.login_signup?.['.error-icon-fill'];
            }

            const login_link_ELEMENT = document.getElementsByClassName('login-link');
            for (let i = 0; i < login_link_ELEMENT.length; i++) {
                login_link_ELEMENT[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.login-link-color'];
                login_link_ELEMENT.getElementsByTagName('a')[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.login-link-a-color'];
                login_link_ELEMENT.getElementsByTagName('a')[i].addEventListener('mouseenter', () => {
                    login_link_ELEMENT.getElementsByTagName('a')[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.login-link-a:hover-color'];
                });
                login_link_ELEMENT.getElementsByTagName('a')[i].addEventListener('mouseleave', () => {
                    login_link_ELEMENT.getElementsByTagName('a')[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.login-link-a-color'];
                });
            }

            const signup_link_ELEMENT = document.getElementsByClassName('sign-up-link');
            for (let i = 0; i < signup_link_ELEMENT.length; i++) {
                signup_link_ELEMENT[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.sign-up-link-color'];
                signup_link_ELEMENT.getElementsByTagName('a')[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.sign-up-link-a-color'];
                signup_link_ELEMENT.getElementsByTagName('a')[i].addEventListener('mouseenter', () => {
                    signup_link_ELEMENT.getElementsByTagName('a')[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.sign-up-link-a:hover-color'];
                });
                signup_link_ELEMENT.getElementsByTagName('a')[i].addEventListener('mouseleave', () => {
                    signup_link_ELEMENT.getElementsByTagName('a')[i].style.color = settings.theme?.[current_theme]?.login_signup?.['.sign-up-link-a-color'];
                });
            }
        }

                                        // Update index CSS
        if (document.title == 'A++ IDE - Home') {
            const h1_ELEMENT = document.getElementsByTagName('h1');
            for (let i = 0; i < h1_ELEMENT.length; i++) {
                h1_ELEMENT[i].style.color = settings.theme?.[current_theme]?.home?.['h1-color'];
                h1_ELEMENT[i].style.textShadow = settings.theme?.[current_theme]?.home?.['h1-text-shadow'];
            }

            const p_ELEMENT = document.getElementsByTagName('p');
            for (let i = 0; i < p_ELEMENT.length; i++) {
                p_ELEMENT[i].style.color = settings.theme?.[current_theme]?.home?.['p-color'];
            }

            const footer_p_ELEMENT = document.getElementsByTagName('footer');
            for (let i = 0; i < footer_p_ELEMENT.length; i++) {
                footer_p_ELEMENT[i].style.color = settings.theme?.[current_theme]?.home?.['footer-color'];
                footer_p_ELEMENT[i].getElementsByTagName('p')[i].style.color = settings.theme?.[current_theme]?.home?.['footer-p-color'];
            }
        }

                                        // Update console CSS
        if (document.title == 'A++ IDE - Console') {
            const console_ELEMENT = document.getElementsByClassName('console');
            for (let i = 0; i < console_ELEMENT.length; i++) {
                console_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.console?.['.console-background-color'];
                console_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.console?.['.console-box-shadow'];
                console_ELEMENT[i].addEventListener('mouseenter', () => {
                    console_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.console?.['.console:hover-box-shadow'];
                });
                console_ELEMENT[i].addEventListener('mouseout', () => {
                    console_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.console?.['.console-box-shadow'];
                });
            }
        }

                                        // Update editor CSS
        if (document.title == 'A++ IDE - Editor') {
            const editor_ELEMENT = document.getElementsByClassName('editor');
            for (let i = 0; i < editor_ELEMENT.length; i++) {
                editor_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.editor?.['.editor-background-color'];
                editor_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.editor?.['.editor-box-shadow'];
            }

            document.getElementById('code-editor').style.fontSize = settings.data_settings?.['font-size'].size + settings.data_settings?.['font-size'].unit;
            document.getElementById('code-editor').style.fontFamily = settings.data_settings?.['font-family'];

            const textarea_ELEMENT = document.getElementsByClassName('textarea');
            for (let i = 0; i < textarea_ELEMENT.length; i++) {
                textarea_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.editor?.['.textarea-background-color'];
                textarea_ELEMENT[i].style.color = settings.theme?.[current_theme]?.editor?.['.textarea-color'];
                textarea_ELEMENT[i].addEventListener('focus', () => {
                    textarea_ELEMENT[i].style.border = settings.theme?.[current_theme]?.editor?.['.textarea:focus-border'];
                    textarea_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.editor?.['.textarea:focus-box-shadow'];
                });
                textarea_ELEMENT[i].addEventListener('blur', () => {
                    textarea_ELEMENT[i].style.border = '';
                    textarea_ELEMENT[i].style.boxShadow = '';
                });
            }
        }

                                        // Update settings CSS
        if (document.title == 'A++ IDE - Settings') {
            const settings_ELEMENT = document.getElementsByClassName('settings');
            for (let i = 0; i < settings_ELEMENT.length; i++) {
                settings_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.settings?.['.settings-background-color'];
                settings_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.settings?.['.settings-box-shadow'];
            }

            const fieldset_ELEMENT = document.getElementsByTagName('fieldset');
            for (let i = 0; i < fieldset_ELEMENT.length; i++) {
                fieldset_ELEMENT[i].style.border = settings.theme?.[current_theme]?.settings?.['fieldset-border'];
                fieldset_ELEMENT[i].style.background = settings.theme?.[current_theme]?.settings?.['fieldset-background'];
                fieldset_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.settings?.['fieldset-box-shadow'];
            }

            const legend_ELEMENT = document.getElementsByTagName('legend');
            for (let i = 0; i < legend_ELEMENT.length; i++) {
                legend_ELEMENT[i].style.color = settings.theme?.[current_theme]?.settings?.['legend-color']
            }

            const preview_area_ELEMENT = document.getElementById('preview-area');
            if (preview_area_ELEMENT) {
                preview_area_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.settings?.['preview-area-box-shadow'];
                preview_area_ELEMENT.style.border = settings.theme?.[current_theme]?.settings?.['preview-area-border'];
                preview_area_ELEMENT.style.background = settings.theme?.[current_theme]?.settings?.['preview-area-background'];
                preview_area_ELEMENT.style.color = settings.theme?.[current_theme]?.settings?.['preview-area-color'];
            }

            const label_ELEMENT = document.getElementsByTagName('label');
            for (let i = 0; i < label_ELEMENT.length; i++) {
                label_ELEMENT[i].style.color = settings.theme?.[current_theme]?.settings?.['label-color'];
            }

            const select_ELEMENT = document.getElementsByTagName('select');
            for (let i = 0; i < select_ELEMENT.length; i++) {
                select_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.settings?.['select-input-background-color'];
                select_ELEMENT[i].style.color = settings.theme?.[current_theme]?.settings?.['select-input-color'];
            }
            
            const input_ELEMENT = document.getElementsByTagName('input');
            for (let i = 0; i < input_ELEMENT.length; i++) {
                if (input_ELEMENT[i].type == 'range' || input_ELEMENT[i].type == 'checkbox') {
                    input_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.settings?.['select-input-background-color'];
                    input_ELEMENT[i].style.color = settings.theme?.[current_theme]?.settings?.['select-input-color'];
                }
            }

            const value_animate_ELEMENT = document.getElementsByClassName('value-animate');
            for (let i = 0; i < value_animate_ELEMENT.length; i++) {
                value_animate_ELEMENT[i].style.color = settings.theme?.[current_theme]?.settings?.['.value-animate-color'];
            }
        }

                                        // Update syntax highlighting CSS
        const comment_ELEMENT = document.getElementsByClassName('hl-comment');
        for (let i = 0; i < comment_ELEMENT.length; i++) {
            comment_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-comment']?.['color'];
            comment_ELEMENT[i].style.fontStyle = settings.theme?.[current_theme]?.['.hl-comment']?.['font-style'];
        }

        const keyword_ELEMENT = document.getElementsByClassName('hl-keyword');
        for (let i = 0; i < keyword_ELEMENT.length; i++) {
            keyword_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-keyword']?.['color'];
            keyword_ELEMENT[i].style.fontWeight = settings.theme?.[current_theme]?.['.hl-keyword']?.['font-weight'];
        }

        const native_type_ELEMENT = document.getElementsByClassName('hl-native-type');
        for (let i = 0; i < native_type_ELEMENT.length; i++) {
            native_type_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-native-type']?.['color'];
        }

        const literal_ELEMENT = document.getElementsByClassName('hl-literal');
        for (let i = 0; i < literal_ELEMENT.length; i++) {
            literal_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-literal']?.['color'];
        }

        const function_method_ELEMENT = document.getElementsByClassName('hl-function-method');
        for (let i = 0; i < function_method_ELEMENT.length; i++) {
            function_method_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-function-method']?.['color'];
        }

        const function_call_ELEMENT = document.getElementsByClassName('hl-function-call');
        for (let i = 0; i < function_call_ELEMENT.length; i++) {
            function_call_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-function-call']?.['color'];
        }
    PASSWORD_ENTERED
        const variable_ELEMENT = document.getElementsByClassName('hl-variable');
        for (let i = 0; i < variable_ELEMENT.length; i++) {
            variable_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-variable']?.['color'];
        }

        const constant_ELEMENT = document.getElementsByClassName('hl-constant');
        for (let i = 0; i < constant_ELEMENT.length; i++) {
            constant_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-constant']?.['color'];
        }

        const string_ELEMENT = document.getElementsByClassName('hl-string');
        for (let i = 0; i < string_ELEMENT.length; i++) {
            string_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-string']?.['color'];
        }

        const import_ELEMENT = document.getElementsByClassName('hl-import');
        for (let i = 0; i < import_ELEMENT.length; i++) {
            import_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-import']?.['color'];
        }

        const control_structure_ELEMENT = document.getElementsByClassName('hl-control-structure');
        for (let i = 0; i < control_structure_ELEMENT.length; i++) {
            control_structure_ELEMENT[i].style.color = settings.theme?.[current_theme]?.['.hl-control-structure']?.['color'];
        }
    });
}

module.exports = { update_theme };