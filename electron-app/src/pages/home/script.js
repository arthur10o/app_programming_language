document.addEventListener("DOMContentLoaded", () => {
    const OPEN_EDITOR_CONSOLE = document.getElementById("open-editor");
    const OPEN_CONSOLE_BUTTON = document.getElementById("open-console");
    const SETTINGS_BUTTON = document.getElementById("settings");

    OPEN_EDITOR_CONSOLE.addEventListener("click", () => {
        window.location.href = "../editor/editor.html";
    });

    OPEN_CONSOLE_BUTTON.addEventListener("click", () => {
        window.location.href = "../console/console.html";

    });

    SETTINGS_BUTTON.addEventListener("click", () => {
        window.location.href = "../settings/settings.html";
    });
});