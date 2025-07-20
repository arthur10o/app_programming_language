document.addEventListener("DOMContentLoaded", () => {
    // Page Éditeur
    const runCodeButton = document.getElementById("run-code");
    const saveCodeButton = document.getElementById("save-code");

    // Page Console
    const clearConsoleButton = document.getElementById("clear-console");
    const consoleOutput = document.getElementById("console-output");

    // Page Paramètres
    const saveSettingsButton = document.getElementById("save-settings");
    const resetSettingsButton = document.getElementById("reset-settings");

    // Fonctionnalités d'Éditeur
    runCodeButton.addEventListener("click", () => {
        console.log("Code en cours d'exécution...");
        // Logique pour exécuter le code
    });

    saveCodeButton.addEventListener("click", () => {
        console.log("Code sauvegardé...");
        // Logique pour sauvegarder le code
    });

    // Fonctionnalités de la Console
    clearConsoleButton.addEventListener("click", () => {
        consoleOutput.textContent = '';
    });

    // Fonctionnalités des Paramètres
    saveSettingsButton.addEventListener("click", () => {
        console.log("Paramètres sauvegardés...");
        // Logique pour sauvegarder les paramètres
    });

    resetSettingsButton.addEventListener("click", () => {
        console.log("Réinitialisation des paramètres...");
        // Logique pour réinitialiser les paramètres
    });
});
