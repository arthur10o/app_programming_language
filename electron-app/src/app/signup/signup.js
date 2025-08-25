/*
  ==============================================================================
  File        : signup.js
  Version     : 1.0
  Description : JavaScript file to manage the sign-up process in A++ IDE
                - Functionality to handle user registration
  Author      : Arthur
  Created     : 2025-08-19
  Last Update : 2025-08-25
  ==============================================================================
*/
import init, { hash_password, encrypt_aes_256_gcm, generate_aes_256_gcm_key, derive_key_from_password } from "../../wasm/crypto_lib/lib.js";
const { ipcRenderer } = require('electron');
const crypto = require('crypto');

let wasmInitialized = false;

(async () => {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').focus();
});

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
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'flex';

    if (all_input_is_valid()) {
        const USERNAME = document.getElementById("username").value;
        const EMAIL = document.getElementById("email").value;
        const PASSWORD = document.getElementById("password").value;
        const REMEMBER_ME = document.getElementById("remember").checked;

        await registerUser(USERNAME, EMAIL, PASSWORD, REMEMBER_ME);
    }
});

document.getElementById("username").addEventListener("input", () => {
    const USERNAME = document.getElementById("username").value;
    if (!is_valid_username(USERNAME)) {
        show_error("username-error", "Username must be between 3 and 20 characters long and can only contain letters, numbers, and underscores.");
    } else {
        hide_error("username-error");
    }
});

document.getElementById("email").addEventListener("input", () => {
    const EMAIL = document.getElementById("email").value;
    if (!is_valid_email(EMAIL)) {
        show_error("email-error", "Invalid email format.");
    } else {
        hide_error("email-error");
    }
});

document.getElementById("password").addEventListener("input", () => {
    const PASSWORD = document.getElementById("password").value;
    if (!is_valid_password(PASSWORD)) {
        show_error("password-error", "Password must be at least 10 characters long and contain uppercase, lowercase, number, and symbol.");
    } else {
        hide_error("password-error");
    }

    const CONFIRM_PASSWORD = document.getElementById("confirm-password").value;
    if (CONFIRM_PASSWORD !== PASSWORD) {
        show_error("password-confirm-error", "Passwords do not match.");
    } else {
        hide_error("password-confirm-error");
    }
});

document.getElementById("confirm-password").addEventListener("input", () => {
    const PASSWORD = document.getElementById("password").value;
    const CONFIRM_PASSWORD = document.getElementById("confirm-password").value;
    if (CONFIRM_PASSWORD !== PASSWORD) {
        show_error("password-confirm-error", "Passwords do not match.");
    } else {
        hide_error("password-confirm-error");
    }
});

function all_input_is_valid() {
    const USERNAME = document.getElementById("username").value;
    const EMAIL = document.getElementById("email").value;
    const PASSWORD = document.getElementById("password").value;
    const CONFIRM_PASSWORD = document.getElementById("confirm-password").value;
    const REMEMBER_ME = document.getElementById("remember").checked;

    if (!is_valid_username(USERNAME)) {
        show_error("username-error", "Username must be between 3 and 20 characters long and can only contain letters, numbers, and underscores.");
        return false
    } else {
        hide_error("username-error");
    }

    if (!is_valid_email(EMAIL)) {
        show_error("email-error", "Invalid email format.");
        return false;
    } else {
        hide_error("email-error");
    }

    if (!is_valid_password(PASSWORD)) {
        show_error("password-error", "Password must be at least 10 characters long and contain uppercase, lowercase, number, and symbol.");
        return false;
    } else {
        hide_error("password-error");
    }

    if (PASSWORD !== CONFIRM_PASSWORD) {
        show_error("password-confirm-error", "Passwords do not match.");
        return false;
    } else {
        hide_error("password-confirm-error");
    }
    return true;
}

function is_valid_username(_username) {
    const LENGTH_IS_VALID = _username.length >= 3 && _username.length <= 20;
    const VALID_FORMAT = /^[a-zA-Z0-9_]+$/.test(_username);
    return LENGTH_IS_VALID && VALID_FORMAT;
}

function is_valid_email(_email) {
    const LENGTH_IS_VALID = _email.length <= 254 && _email.length > 0;
    const VALID_FORMAT = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(_email)
    return LENGTH_IS_VALID && VALID_FORMAT
}

function is_valid_password(_password) {
    const LENGTH_IS_VALID = _password.length >= 10;
    const CONTAINS_UPPERCASE = /[A-Z]/.test(_password);
    const CONTAINS_LOWERCASE = /[a-z]/.test(_password);
    const CONTAINS_NUMBER = /[0-9]/.test(_password);
    const CONTAINS_SYMBOL = /[^a-zA-Z0-9]/.test(_password);
    const CONTAINS_SPACE = /\s/.test(_password);
    return LENGTH_IS_VALID && CONTAINS_UPPERCASE && CONTAINS_LOWERCASE && CONTAINS_NUMBER && CONTAINS_SYMBOL && !CONTAINS_SPACE;
}

async function registerUser(_username, _email, _password, _remember_me) {
    const spinner = document.getElementById('loading-spinner');

    try {
        const PASSWORD_HASH = hash_password(_password);

        const KEY_BYTES = generate_aes_256_gcm_key();
        const { key: KEY_DERIVED, salt: SALT_DERIVED } = await derive_key_from_password(_password);
        const { cipher: CIPHER_AES_KEY, nonce: NONCE_AES_KEY } = await encrypt_aes_256_gcm(
            btoa(String.fromCharCode(...KEY_BYTES)),
            Uint8Array.from(atob(KEY_DERIVED), c => c.charCodeAt(0))
        );

        const ENCRYPTED_RESULT_USERNAME = encrypt_aes_256_gcm(_username, KEY_BYTES);
        const ENCRYPTED_RESULT_EMAIL = encrypt_aes_256_gcm(_email, KEY_BYTES);

        const { cipher: CIPHER_USERNAME, nonce: NONCE_USERNAME } = await ENCRYPTED_RESULT_USERNAME;
        const { cipher: CIPHER_EMAIL, nonce: NONCE_EMAIL } = await ENCRYPTED_RESULT_EMAIL;

        let keybindings = {};
        ipcRenderer.send('get-default-keybindings');

        ipcRenderer.on('get-default-keybindings-reply', async (event, _keybindingsData) => {
            keybindings = typeof _keybindingsData === 'string' ? JSON.parse(_keybindingsData) : _keybindingsData;
            const USER_ID = crypto.randomUUID();

            let new_user = {
                "user_id": USER_ID,
                "username": { "cipher": CIPHER_USERNAME, "nonce": NONCE_USERNAME },
                "email": { "cipher": CIPHER_EMAIL, "nonce": NONCE_EMAIL },
                "aes_key_encrypted": { "cipher": CIPHER_AES_KEY, "nonce": NONCE_AES_KEY },
                "aes_salt": SALT_DERIVED,
                "password": PASSWORD_HASH,
                "last_project_path": "",
                "profil_picture": "",
                "preferences": {
                    "theme": "dark",
                    "fontSize": { size: 14, unit: "px" },
                    "fontFamily": "Segoe UI",
                    "language": "en",
                    "autoSave": false,
                    "tabSize": 4,
                    "autocomplete": true,
                    "showSuggestions": true,
                    "syntaxHighlighting": true,
                    "showLineNumbers": true
                },
                "keybindings": keybindings
            };

            _password = null;
            _email = null;
            _username = null;

            ipcRenderer.send('register-user', new_user);
            const SESSION = {
                connected_user: {
                    user_id: USER_ID,
                    token: crypto.randomUUID(),
                    date_of_connection: Date.now(),
                    expires_at: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 Days
                    rememberMe: _remember_me
                }
            };
            const SESSION_JSON = JSON.stringify(SESSION);
            const ENCRYPTED_SESSION = await encrypt_aes_256_gcm(SESSION_JSON, KEY_BYTES);
            ipcRenderer.send('save-session', {
                cipher: ENCRYPTED_SESSION.cipher,
                nonce: ENCRYPTED_SESSION.nonce,
                user_id: USER_ID
            });
            window.location.href = "../home/index.html";
        });
    } catch (error) {
        ipcRenderer.send('show-popup', 'Registration Error', 'An unexpected error occurred while finalizing registration. Please try again.', 'error', [], [{ label: "Close", action: null }], 0);
        document.getElementById("registration-error").textContent = "An error occurred during registration. Please try again.";
    }
    finally {
        setTimeout(() => spinner.style.display = 'none', 300);
    }
}

function show_error(_id, _message) {
    const container = document.getElementById(_id);
    const text = container.querySelector('.error-text');
    text.textContent = _message;
    container.style.display = 'flex';
    container.classList.add('visible');
}

function hide_error(_id) {
    const container = document.getElementById(_id);
    container.classList.remove('visible');
    setTimeout(() => container.style.display = 'none', 300);
}