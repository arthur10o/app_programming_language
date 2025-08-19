/*
  ==============================================================================
  File        : signup.js
  Version     : 1.0
  Description : JavaScript file to manage the sign-up process in A++ IDE
                - Functionality to handle user registration
  Author      : Arthur
  Created     : 2025-08-19
  Last Update : 2025-08-19
  ==============================================================================
*/
import init, { hash_password } from "../../wasm/crypto_lib/lib.js";

let wasmInitialized = false;

(async () => {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
    }
})();

document.getElementById('toggle-confirm-password-id').addEventListener('click', () => {
    const PASSWORD_INPUT = document.getElementById('confirm-password');
    const EYE_ICON = document.getElementById('eye-icon-confirm-password');

    const IS_HIDDEN = PASSWORD_INPUT.type === 'password';
    PASSWORD_INPUT.type = IS_HIDDEN ? 'text' : 'password';

    EYE_ICON.innerHTML = IS_HIDDEN
        ? '<path d="M12 5c-5.05 0-9.27 3.11-11 7 1.06 2.38 3.09 4.39 5.66 5.48l-1.16 1.16 1.41 1.41L20.49 4.51 19.08 3.1l-2.5 2.5C15.24 4.89 13.67 4.5 12 4.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5 0-.86.2-1.68.55-2.41l1.62 1.62a3.49 3.49 0 0 0 4.77 4.77l1.62 1.62c-.73.35-1.55.55-2.41.55z"/>'
        : '<path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5S8.97 6.5 12 6.5 17.5 8.97 17.5 12 15.03 17.5 12 17.5zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>';
});

document.getElementById('toggle-password-id').addEventListener('click', () => {
    const PASSWORD_INPUT = document.getElementById('password');
    const EYE_ICON = document.getElementById('eye-icon-password');

    const IS_HIDDEN = PASSWORD_INPUT.type === 'password';
    PASSWORD_INPUT.type = IS_HIDDEN ? 'text' : 'password';

    EYE_ICON.innerHTML = IS_HIDDEN
        ? '<path d="M12 5c-5.05 0-9.27 3.11-11 7 1.06 2.38 3.09 4.39 5.66 5.48l-1.16 1.16 1.41 1.41L20.49 4.51 19.08 3.1l-2.5 2.5C15.24 4.89 13.67 4.5 12 4.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5 0-.86.2-1.68.55-2.41l1.62 1.62a3.49 3.49 0 0 0 4.77 4.77l1.62 1.62c-.73.35-1.55.55-2.41.55z"/>'
        : '<path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5S8.97 6.5 12 6.5 17.5 8.97 17.5 12 15.03 17.5 12 17.5zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>';
});

document.getElementById('signup-button').addEventListener('click', async (event) => {
    event.preventDefault();
    const USERNAME = document.getElementById("username").value;
    const EMAIL = document.getElementById("email").value;
    const PASSWORD = document.getElementById("password").value;
    const CONFIRM_PASSWORD = document.getElementById("confirm-password").value;
    const REMEMBER_ME = document.getElementById("remember").checked;
    // if (!USERNAME || !EMAIL || !PASSWORD || !CONFIRM_PASSWORD) {
    //     alert("All fields are required! [TODO]");
    //     return;
    // }
    // if (!EMAIL.includes('@')) {
    //     alert("Invalid email format! [TODO]");
    //     return;
    // }
    // if (PASSWORD.length < 8) {
    //     alert("Password must be at least 8 characters long! [TODO]");
    //     return;
    // }
    // if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(PASSWORD)) {
    //     alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character! [TODO]");
    //     return;
    // }
    // if (!/^[a-zA-Z0-9_]+$/.test(USERNAME)) {
    //     alert("Username can only contain letters, numbers, and underscores! [TODO]");
    //     return;
    // }
    // if (USERNAME.length < 3 || USERNAME.length > 20) {
    //     alert("Username must be between 3 and 20 characters long! [TODO]");
    //     return;
    // }
    // if (EMAIL.length < 5 || EMAIL.length > 50) {
    //     alert("Email must be between 5 and 50 characters long! [TODO]");
    //     return;
    // }
    // if (PASSWORD !== CONFIRM_PASSWORD) {
    //     alert("Passwords do not match! [TODO]");
    //     return;
    // }
    await registerUser(USERNAME, EMAIL, PASSWORD, REMEMBER_ME);
});

async function registerUser(_username, _email, _password, _remember_me) {
    const PASSWORD_HASH = hash_password(_password);
    alert(PASSWORD_HASH);
}