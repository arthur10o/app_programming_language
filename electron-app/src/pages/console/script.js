const CONSOLE_OUTPUT = document.getElementById("console-output");
const CLEAR_BUTTON = document.getElementById("clear-console");

CLEAR_BUTTON.addEventListener("click", () => {
    CONSOLE_OUTPUT.innerHTML = "Welcome to the console. Messages will appear here...";
});