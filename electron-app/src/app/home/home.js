/*
  ==============================================================================
  File        : home.js
  Version     : 1.0
  Description : JavaScript file to manage the home in A++ IDE
  Author      : Arthur
  Created     : 2025-07-26
  Last Update : 2025-08-20
  ==============================================================================
*/
document.addEventListener('DOMContentLoaded', () => {
    const OPEN_EDITOR_CONSOLE = document.getElementById('open-editor');
    const OPEN_CONSOLE_BUTTON = document.getElementById('open-console');
    const SETTINGS_BUTTON = document.getElementById('settings');

    OPEN_EDITOR_CONSOLE.addEventListener('click', () => {
        window.location.href = '../editor/editor.html';
    });

    OPEN_CONSOLE_BUTTON.addEventListener('click', () => {
        window.location.href = '../console/console.html';

    });

    SETTINGS_BUTTON.addEventListener('click', () => {
        window.location.href = '../settings/settings.html';
    });
    
    ipcRenderer.send('get-connected-user-information');
    ipcRenderer.on('received-connected-user-information', (event, _data_user) => {
        const USER = _data_user[0]?.connected_user;
        if (!USER || !USER?.date_of_connection) window.location.href = '../login/login.html';

        const CONECTED_AT = new Date(USER?.date_of_connection);
        const NOW = new Date();
        const LAPSE_MS = NOW - CONECTED_AT;

        const DAYS = Math.floor(LAPSE_MS / (1000 * 60 * 60 * 24)).toFixed(10);
        if ((USER?.rememberMe == false) || (USER?.rememberMe !== false && USER?.rememberMe !== true) || (DAYS >= 30)) {
            window.location.href = '../login/login.html';
        }
    });
});

function toggle_menu() {
    const menu = document.getElementById('dropdown-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

window.addEventListener('click', function (e) {
    const trigger = document.querySelector('.menu-trigger');
    const menu = document.getElementById('dropdown-menu');

    if (!trigger.contains(e.target)) {
        menu.style.display = 'none';
    }
});