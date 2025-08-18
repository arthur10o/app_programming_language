/*
    FIle        : script.js
    Version     : 1.0
    Description : Login script for A++ IDE
    Author      : Arthur
    Created     : 2025-08-16
    Last Update : 2025-08-18
*/
import init, { verify_password } from "../../wasm/verify_password/verify_password.js";

let wasmInitialized = false;

(async () => {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
    }
})();

document.getElementById('toggle-password-id').addEventListener('click', () => {
    const PASSWORD_INPUT = document.getElementById('password');
    const EYE_ICON = document.getElementById('eye-icon');

    const IS_HIDDEN = PASSWORD_INPUT.type === 'password';
    PASSWORD_INPUT.type = IS_HIDDEN ? 'text' : 'password';

    EYE_ICON.innerHTML = IS_HIDDEN
        ? '<path d="M12 5c-5.05 0-9.27 3.11-11 7 1.06 2.38 3.09 4.39 5.66 5.48l-1.16 1.16 1.41 1.41L20.49 4.51 19.08 3.1l-2.5 2.5C15.24 4.89 13.67 4.5 12 4.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5 0-.86.2-1.68.55-2.41l1.62 1.62a3.49 3.49 0 0 0 4.77 4.77l1.62 1.62c-.73.35-1.55.55-2.41.55z"/>'
        : '<path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5S8.97 6.5 12 6.5 17.5 8.97 17.5 12 15.03 17.5 12 17.5zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>';
});

document.getElementById('login-button').addEventListener('click', async (event) => {
    event.preventDefault();
    await verifyUserPassword();
});

async function verifyUserPassword() {
    const PASSWORD = document.getElementById("password").value;
    const HASH = "[TODO]"
    const IS_VALID = verify_password(HASH, PASSWORD);
    if (IS_VALID) {
        alert("[TODO] Mot de passe correct !");
    } else {
        alert("[TODO] Mot de passe incorrect !");
    }
}