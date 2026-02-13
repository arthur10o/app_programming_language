/*
  ==============================================================================
  File        : console.js
  Version     : 1.0
  Description : JavaScript file to manage the console in A++ IDE
                - Functionality to clear console output
  Author      : Arthur
  Created     : 2025-07-26
  Last Update : 2025-09-01
  ==============================================================================
*/
const CONSOLE_OUTPUT = document.getElementById('console-output');
const CLEAR_BUTTON = document.getElementById('clear-console');

async function init_console_text() {
  await wait_for_translation();
  if (CONSOLE_OUTPUT) {
    CONSOLE_OUTPUT.innerText = t('default_message_console_output');
  }
}

CLEAR_BUTTON.addEventListener('click', async () => {
  await wait_for_translation();
  CONSOLE_OUTPUT.innerText = t('default_message_console_output');
});

init_console_text();