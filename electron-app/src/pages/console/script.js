/*
    FIle        : script.js
    Version     : 1.0
    Description : Console script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-26
    Last Update : 2025-07-26
*/
const CONSOLE_OUTPUT = document.getElementById("console-output");
const CLEAR_BUTTON = document.getElementById("clear-console");

CLEAR_BUTTON.addEventListener("click", () => {
    CONSOLE_OUTPUT.innerHTML = "Welcome to the console. Messages will appear here...";
});