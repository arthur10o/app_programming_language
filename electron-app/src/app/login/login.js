/*
  ==============================================================================
  File        : login.js
  Version     : 1.0
  Description : JavaScript file to manage the login in A++ IDE
  Author      : Arthur
  Created     : 2025-08-16
  Last Update : 2025-08-25
  ==============================================================================
*/
const crypto = require('crypto');
import init, { verify_password, derive_key_from_password, decrypt_aes_256_gcm, encrypt_aes_256_gcm } from "../../wasm/crypto_lib/lib.js";

let wasmInitialized = false;

(async () => {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('email').focus();
});

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
    try {
        const USERS = await get_users();
        const EMAIL = document.getElementById('email').value;
        const PASSWORD = document.getElementById('password').value;
        const USER_FIND = await find_user_by_email(USERS, EMAIL, PASSWORD);
        const USER_ID = USER_FIND.user_id;
        const KEY_BYTES = USER_FIND.key_bytes;
        if (!USER_FIND || !USER_ID) {
            ipcRenderer.send('show-popup', 'Error', 'Authentication failed due to invalid credentials or decryption error.', 'error', [], [{ label: "Close", action: null }], 0);
            return;
        }
        const SESSION = {
            connected_user: {
                user_id: USER_ID,
                token: crypto.randomUUID(),
                date_of_connection: Date.now(),
                expires_at: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 Days
                rememberMe: document.getElementById('rememberMe')?.checked || false
            }
        };
        const SESSION_JSON = JSON.stringify(SESSION);
        const ENCRYPTED_SESSION = encrypt_aes_256_gcm(SESSION_JSON, KEY_BYTES);
        ipcRenderer.send('save-session', {
            cipher: ENCRYPTED_SESSION.cipher,
            nonce: ENCRYPTED_SESSION.nonce,
            user_id: USER_ID
        });
        window.location.href = '../home/index.html';
    } catch (error) {
        ipcRenderer.send('show-popup', 'Error', 'Failed to retrieve user information. Please try again later.', 'error', [], [{ label: "Close", action: null }], 0);
    }
});

function get_users() {
    return new Promise((resolve, reject) => {
        ipcRenderer.once('received-users-information', (event, _users) => {
            resolve(_users);
        });
        ipcRenderer.send('get-users-for-login');
    });
};

async function find_user_by_email(_users, _email, _password) {
    for (const USER of _users) {
        const IS_VALID_PASSWORD = await check_password(USER.password, _password);
        if (IS_VALID_PASSWORD) {
            try {
                const DERIVED_KEY_OBJECT = await derive_key_from_password(_password, USER.aes_salt);
                const DERIVED_KEY_BYTES = base64_to_bytes(DERIVED_KEY_OBJECT.key);

                const AES_KEY_ENCRYPTED_NONCE = USER.aes_key_encrypted.nonce;
                const AES_KEY_ENCRYPTED_CIPHER = USER.aes_key_encrypted.cipher;
                const AES_KEY_BASE64 = await decrypt_aes_256_gcm(AES_KEY_ENCRYPTED_NONCE, AES_KEY_ENCRYPTED_CIPHER, DERIVED_KEY_BYTES);
                const AES_KEY_BYTES = base64_to_bytes(AES_KEY_BASE64);

                if (!(AES_KEY_BYTES instanceof Uint8Array) || AES_KEY_BYTES.length !== 32) {
                    ipcRenderer.send('show-popup', 'Decryption Error', 'Unable to validate encryption key. Please verify your credentials.', 'error', [], [{ label: "Close", action: null }], 0);
                    return;
                }

                const EMAIL_DECRYPTED = await decrypt_aes_256_gcm(USER.email.nonce, USER.email.cipher, AES_KEY_BYTES);
                if (EMAIL_DECRYPTED == _email) {
                    return  {user_id: USER.user_id, key_bytes: AES_KEY_BYTES};
                } else {
                    return null;
                }
            } catch (e) {
                ipcRenderer.send('show-popup', 'Decryption Error', 'An error occurred while decrypting user data.', 'error', [], [{ label: "Close", action: null }], 0);
            }
        } else {
            return null;
        }
    }
}

function base64_to_bytes(_base64) {
    const BINARY = atob(_base64);
    const LEN = BINARY.length;
    const BYTES = new Uint8Array(LEN);
    for (let i = 0; i < LEN; i++) {
        BYTES[i] = BINARY.charCodeAt(i);
    }
    return BYTES;
}

async function check_password(_hashed_password, _password) {
    const IS_VALID_PASSWORD = await verify_password(_hashed_password, _password);
    return IS_VALID_PASSWORD;
}