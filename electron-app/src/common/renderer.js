/*
  ==============================================================================
  File        : renderer.js
  Version     : 1.0
  Description : JavaScript file to manage the renderer in A++ IDE
  Author      : Arthur
  Created     : 2025-08-13
  Last Update : 2025-08-19
  ==============================================================================
*/
const { shell } = require('electron');

document.addEventListener('click', (event) => {
  const TARGET = event.target;

  if (TARGET.tagName === 'A' && TARGET.href.startsWith('http')) {
    event.preventDefault();
    shell.openExternal(TARGET.href);
  }
});