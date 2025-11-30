/*
  ==============================================================================
  File        : styleManager.js
  Version     : 1.0
  Description : JavaScript file to manage the styles in A++ IDE
                - Functionality to update styles based on user settings
  Author      : Arthur
  Created     : 2025-07-26
  Last Update : 2025-11-29
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
        ipcRenderer.send('show-popup', 'settings_load_error', 'unable_load_user_settings_file', 'error', [], [{ label: "close_button", action: null }], 0);
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
            ipcRenderer.send('show-popup', 'settings_load_error', 'error_when_reading_json_file', 'error', [], [{ label: "close_button", action: null }], 0);
            return;
        }

        let current_theme = user_settings?.preferences?.['theme'] || 'dark';
        let font_size_size = user_settings?.preferences?.fontSize?.['size'];
        let font_size_unit = user_settings?.preferences?.fontSize?.['unit'];
        let font_family = user_settings?.preferences?.['fontFamily'];
        
        if (!current_theme) {
            ipcRenderer.send('show-popup', 'theme_load_error', 'theme_settings_could_not_be_found', 'error', [], [{ label: "close_button", action: null }], 0);
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

        const SPINNER_ELEMENT = document.getElementsByClassName('spinner');
        for (let i = 0; i < SPINNER_ELEMENT.length; i++) {
            SPINNER_ELEMENT[i].style.borderTop = settings.theme?.[current_theme]?.common_css?.['.spinner-border-top'];
            SPINNER_ELEMENT[i].style.borderColor = settings.theme?.[current_theme]?.common_css?.['.spinner-border'];
        }

        const LOADER_ELEMENT = document.getElementById('loader');
        if (LOADER_ELEMENT) {
            LOADER_ELEMENT.style.background = settings.theme?.[current_theme]?.common_css?.['#loader-background'];
            LOADER_ELEMENT.getElementsByTagName('span')[0].style.color = settings.theme?.[current_theme]?.common_css?.['#loader-span-color'];
        }

        const SEARCH_REPLACE_PANEL_ELEMENT = document.getElementsByClassName('search-replace-panel');
        for (let i = 0; i < SEARCH_REPLACE_PANEL_ELEMENT.length; i++) {
            SEARCH_REPLACE_PANEL_ELEMENT[i].style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.search-replace-panel-background-color'];
            SEARCH_REPLACE_PANEL_ELEMENT[i].style.border = settings.theme?.[current_theme]?.common_css?.['.search-replace-panel-border'];
            SEARCH_REPLACE_PANEL_ELEMENT[i].style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.search-replace-panel-box-shadow'];
        }

        const SEARCH_HEADER_INPUT_ELEMENT = document.getElementById('searchInput');
        if (SEARCH_HEADER_INPUT_ELEMENT) {
            SEARCH_HEADER_INPUT_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.search-header-input-background-color'];
            SEARCH_HEADER_INPUT_ELEMENT.style.border = settings.theme?.[current_theme]?.common_css?.['.search-header-input-border'];
            SEARCH_HEADER_INPUT_ELEMENT.style.color = settings.theme?.[current_theme]?.common_css?.['.search-header-input-color'];
            SEARCH_HEADER_INPUT_ELEMENT.addEventListener('focus', () => {
                SEARCH_HEADER_INPUT_ELEMENT.style.border = settings.theme?.[current_theme]?.common_css?.['.search-header-input:focus-border'];
                SEARCH_HEADER_INPUT_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.search-header-input:focus-box-shadow'];
            });
            SEARCH_HEADER_INPUT_ELEMENT.addEventListener('blur', () => {
                SEARCH_HEADER_INPUT_ELEMENT.style.border = '';
                SEARCH_HEADER_INPUT_ELEMENT.style.boxShadow = '';
            });
        }

        const SEARCH_REPLACE_INPUT_ELEMENT = document.getElementById('replaceInput');
        if (SEARCH_REPLACE_INPUT_ELEMENT) {
            SEARCH_REPLACE_INPUT_ELEMENT.addEventListener('focus', () => {
                SEARCH_REPLACE_INPUT_ELEMENT.style.border = settings.theme?.[current_theme]?.common_css?.['.search-replace-input:focus-border'];
                SEARCH_REPLACE_INPUT_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.search-replace-input:focus-box-shadow'];
            });
            SEARCH_REPLACE_INPUT_ELEMENT.addEventListener('blur', () => {
                SEARCH_REPLACE_INPUT_ELEMENT.style.border = '';
                SEARCH_REPLACE_INPUT_ELEMENT.style.boxShadow = '';
            });
        }

        const CLOSE_BUTTON_ELEMENT = document.getElementsByClassName('close-btn');
        for (let i = 0; i < CLOSE_BUTTON_ELEMENT.length; i++) {
            CLOSE_BUTTON_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.close-button-color'];
            CLOSE_BUTTON_ELEMENT[i].addEventListener('mouseenter', () => {
                CLOSE_BUTTON_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.close-button-hover-color'];
            });
            CLOSE_BUTTON_ELEMENT[i].addEventListener('mouseout', () => {
                CLOSE_BUTTON_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.close-button-color'];
            });
        }

        const REPLACE_INPUT_ELEMENT = document.getElementById('replaceInput');
        if (REPLACE_INPUT_ELEMENT) {
            REPLACE_INPUT_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.replace-row-input-background-color'];
            REPLACE_INPUT_ELEMENT.style.border = settings.theme?.[current_theme]?.common_css?.['.replace-row-input-border'];
            REPLACE_INPUT_ELEMENT.style.color = settings.theme?.[current_theme]?.common_css?.['.search-replace-input-color'];
        }

        const REPLACE_ROW_ELEMENT = document.getElementsByClassName('replace-row');
        for (let i = 0; i < REPLACE_ROW_ELEMENT.length; i++) {
            REPLACE_ROW_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.replace-row-color'];
        }

        const ACTIONS_BUTTON_REPLACE_ALL_ELEMENT = document.getElementById('replaceAllBtn');
        if (ACTIONS_BUTTON_REPLACE_ALL_ELEMENT) {
            ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.action-button-background-color'];
            ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button-box-shadow'];
            ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.addEventListener('mouseenter', () => {
                ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.action-button:hover-background-color'];
                ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button:hover-box-shadow'];
            });
            ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.addEventListener('mouseout', () => {
                ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.action-button-background-color'];
                ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button-box-shadow'];
            });
            ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.addEventListener('active', () => {
                ACTIONS_BUTTON_REPLACE_ALL_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button:active-box-shadow'];
            });
        }

        const ACTIONS_BUTTON_REPLACE_ELEMENT = document.getElementById('replaceBtn');
        if (ACTIONS_BUTTON_REPLACE_ELEMENT) {
            ACTIONS_BUTTON_REPLACE_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.action-button-background-color'];
            ACTIONS_BUTTON_REPLACE_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button-box-shadow'];
            ACTIONS_BUTTON_REPLACE_ELEMENT.addEventListener('mouseenter', () => {
                ACTIONS_BUTTON_REPLACE_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.action-button:hover-background-color'];
                ACTIONS_BUTTON_REPLACE_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button:hover-box-shadow'];
            });
            ACTIONS_BUTTON_REPLACE_ELEMENT.addEventListener('mouseout', () => {
                ACTIONS_BUTTON_REPLACE_ELEMENT.style.backgroundColor = settings.theme?.[current_theme]?.common_css?.['.action-button-background-color'];
                ACTIONS_BUTTON_REPLACE_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button-box-shadow'];
            });
            ACTIONS_BUTTON_REPLACE_ELEMENT.addEventListener('active', () => {
                ACTIONS_BUTTON_REPLACE_ELEMENT.style.boxShadow = settings.theme?.[current_theme]?.common_css?.['.action-button:active-box-shadow'];
            });
        }

        const SEARCH_STAT_ELEMENT = document.getElementsByClassName('search-stat');
        for (let i = 0; i < SEARCH_STAT_ELEMENT.length; i++) {
            SEARCH_STAT_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.search-stat-color'];
        }

        const ARROW_UP_ELEMENT = document.getElementsByClassName('arrow-up');
        for (let i = 0; i < ARROW_UP_ELEMENT.length; i++) {
            ARROW_UP_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.arrow-up-color'];
            ARROW_UP_ELEMENT[i].addEventListener('mouseenter', () => {
                ARROW_UP_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.arrow-up-color:hover'];
            });
            ARROW_UP_ELEMENT[i].addEventListener('mouseout', () => {
                ARROW_UP_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.arrow-up-color'];
            });
        }

        const ARROW_DOWN_ELEMENT = document.getElementsByClassName('arrow-down');
        for (let i = 0; i < ARROW_DOWN_ELEMENT.length; i++) {
            ARROW_DOWN_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.arrow-down-color'];
            ARROW_DOWN_ELEMENT[i].addEventListener('mouseenter', () => {
                ARROW_DOWN_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.arrow-down-color:hover'];
            });
            ARROW_DOWN_ELEMENT[i].addEventListener('mouseout', () => {
                ARROW_DOWN_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['.arrow-down-color'];
            });
        }

        const html_ELEMENT = document.documentElement;
        html_ELEMENT.style.fontSize = `${font_size_size}${font_size_unit}`;

        document.body.style.fontFamily = font_family;

                                        // Update login/signup css
        if (document.title == 'A++ IDE - Sign Up' || document.title == 'A++ IDE - Login' || document.title == 'A++ IDE - Connexion' || document.title == 'A++ IDE - Inscription' || document.title == 'A++ IDE - Iniciar sesión' || document.title == 'A++ IDE - Registrarse') {
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
        if (document.title == 'A++ IDE - Home' || document.title == 'A++ IDE - Accueil' || document.title == 'A++ IDE - Inicio') {
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
        if (document.title == 'A++ IDE - Console' || document.title == 'A++ IDE - Consola') {
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
        if (document.title == 'A++ IDE - Editor' || document.title == 'A++ IDE - Éditeur') {
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
        if (document.title == 'A++ IDE - Settings' || document.title == 'A++ IDE - Paramètres' || document.title == 'A++ IDE - Configuración') {
            const a_ELEMENT = document.getElementsByTagName('a');
            for (let i = 0; i < a_ELEMENT.length; i++) {
                a_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['hyperlinks-color'];
                a_ELEMENT[i].addEventListener('mouseenter', () => {
                    a_ELEMENT[i].style.color = 'inherit';
                });
                a_ELEMENT[i].addEventListener('mouseout', () => {
                    a_ELEMENT[i].style.color = settings.theme?.[current_theme]?.common_css?.['hyperlinks-color'];
                });
            }

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

                                        // Update keybindings CSS
        if (document.title == 'A++ IDE - Raccourcis clavier' || document.title == 'A++ IDE - Atajos de teclado' || document.title == 'A++ IDE - Keybindings') {
            const TR_ELEMENTS = document.getElementsByTagName('tr');
            for (let i = 0; i < TR_ELEMENTS.length; i++) {
                TR_ELEMENTS[i].style.borderBottomColor = settings.theme?.[current_theme]?.keybindings?.['tr-border-bottom'];
            }

            const T_BODY_ELEMENTS = document.getElementsByTagName('tbody');
            for (let i = 0; i < T_BODY_ELEMENTS.length; i++) {
                const T_BODY_ELEMENTS_I_TR = T_BODY_ELEMENTS[i].getElementsByTagName('tr');
                for (let j = 0; j < T_BODY_ELEMENTS_I_TR.length; j++) {
                    T_BODY_ELEMENTS_I_TR[j].style.borderBottomColor = settings.theme?.[current_theme]?.keybindings?.['tbody-tr-border-bottom-color'];
                    T_BODY_ELEMENTS_I_TR[j].style.borderBottom = settings.theme?.[current_theme]?.keybindings?.['tbody-tr-border-bottom'];
                    T_BODY_ELEMENTS_I_TR[j].addEventListener('mouseenter', () => {
                        T_BODY_ELEMENTS_I_TR[j].style.backgroundColor = settings.theme?.[current_theme]?.keybindings?.['tbody-tr-hover-background-color'];
                        T_BODY_ELEMENTS_I_TR[j].style.boxShadow = settings.theme?.[current_theme]?.keybindings?.['tbody-tr-hover-box-shadow'];
                    });
                    T_BODY_ELEMENTS_I_TR[j].addEventListener('mouseout', () => {
                        T_BODY_ELEMENTS_I_TR[j].style.backgroundColor = '';
                        T_BODY_ELEMENTS_I_TR[j].style.boxShadow = '';
                    });
                }
                const TD_FIRST_CHILD_ELEMENTS = document.querySelectorAll('tbody td:first-child');
                for (let j = 0; j <TD_FIRST_CHILD_ELEMENTS.length; j++) {
                    TD_FIRST_CHILD_ELEMENTS[j].style.color = settings.theme?.[current_theme]?.keybindings?.['tbody-td-first-child-color'];
                }
            }

            const KEY_CHIP_ELEMENTS = document.getElementsByClassName('key_chip');
            for (let i = 0; i < KEY_CHIP_ELEMENTS.length; i++) {
                const KEY_ELEMMENTS = KEY_CHIP_ELEMENTS[i].getElementsByClassName('key');
                for (let j = 0; j < KEY_ELEMMENTS.length; j++) {
                    KEY_ELEMMENTS[j].style.background = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-background-color'];
                    KEY_ELEMMENTS[j].style.borderColor = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-border-color'];
                    KEY_ELEMMENTS[j].style.color = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-color'];
                    KEY_ELEMMENTS[j].style.boxShadow = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-box-shadow'];
                    KEY_ELEMMENTS[j].style.border = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-border'];
                    KEY_ELEMMENTS[j].addEventListener('mouseenter', () => {
                        KEY_ELEMMENTS[j].style.background = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-hover-background-color'];
                        KEY_ELEMMENTS[j].style.borderColor = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-hover-border-color'];
                        KEY_ELEMMENTS[j].style.boxShadow = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-hover-box-shadow'];
                    });
                    KEY_ELEMMENTS[j].addEventListener('mouseout', () => {
                        KEY_ELEMMENTS[j].style.background = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-background-color'];
                        KEY_ELEMMENTS[j].style.borderColor = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-border-color'];
                        KEY_ELEMMENTS[j].style.boxShadow = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-box-shadow'];
                        KEY_ELEMMENTS[j].style.border = settings.theme?.[current_theme]?.keybindings?.['.key-chip-key-border'];
                    });
                }
                const HINT_ELEMENTS = KEY_CHIP_ELEMENTS[i].getElementsByClassName('hint');
                for (let j = 0; j < HINT_ELEMENTS.length; j++) {
                    HINT_ELEMENTS[j].style.color = settings.theme?.[current_theme]?.keybindings?.['.key-chip-hint-color'];
                }
                KEY_CHIP_ELEMENTS[i].addEventListener('mouseenter', () => {
                    KEY_CHIP_ELEMENTS[i].style.backgroundColor = settings.theme?.[current_theme]?.keybindings?.['.key-chip-hover-background-color'];
                });
                KEY_CHIP_ELEMENTS[i].addEventListener('mouseout', () => {
                    KEY_CHIP_ELEMENTS[i].style.backgroundColor = '';
                });
            }

            const KEY_INPUT_ELEMENTS = document.getElementsByClassName('key_input');
            for (let i = 0; i < KEY_INPUT_ELEMENTS.length; i++) {
                KEY_INPUT_ELEMENTS[i].style.backgroundColor = settings.theme?.[current_theme]?.keybindings?.['.key-input-background-color'];
                KEY_INPUT_ELEMENTS[i].style.color = settings.theme?.[current_theme]?.keybindings?.['.key-input-color'];
                KEY_INPUT_ELEMENTS[i].style.borderColor = settings.theme?.[current_theme]?.keybindings?.['.key-input-border-color'];
                KEY_INPUT_ELEMENTS[i].style.border = settings.theme?.[current_theme]?.keybindings?.['.key-input-border'];
                KEY_INPUT_ELEMENTS[i].addEventListener('focus', () => {
                    KEY_INPUT_ELEMENTS[i].style.borderColor = settings.theme?.[current_theme]?.keybindings?.['.key-input-focus-border'];
                    KEY_INPUT_ELEMENTS[i].style.boxShadow = settings.theme?.[current_theme]?.keybindings?.['.key-input-focus-box-shadow'];
                    KEY_INPUT_ELEMENTS[i].style.backgroundColor = settings.theme?.[current_theme]?.keybindings?.['.key-input-focus-background-color'];
                    KEY_INPUT_ELEMENTS[i].style.border = settings.theme?.[current_theme]?.keybindings?.['.key-input-border'];
                });
                KEY_INPUT_ELEMENTS[i].addEventListener('blur', () => {
                    KEY_INPUT_ELEMENTS[i].style.borderColor = settings.theme?.[current_theme]?.keybindings?.['.key-input-border-color'];
                    KEY_INPUT_ELEMENTS[i].style.boxShadow = '';
                    KEY_INPUT_ELEMENTS[i].style.backgroundColor = settings.theme?.[current_theme]?.keybindings?.['.key-input-background-color'];
                });
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