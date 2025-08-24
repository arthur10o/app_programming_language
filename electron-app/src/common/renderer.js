/*
  ==============================================================================
  File        : renderer.js
  Version     : 1.0
  Description : JavaScript file to manage the renderer in A++ IDE
  Author      : Arthur
  Created     : 2025-08-13
  Last Update : 2025-08-24
  ==============================================================================
*/
import init, { verify_password, derive_key_from_password, decrypt_aes_256_gcm } from "../wasm/crypto_lib/lib.js";

const { shell, ipcRenderer } = require('electron');

let wasmInitialized = false;

(async () => {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
    }
})();

document.addEventListener('click', (event) => {
  const TARGET = event.target;

  if (TARGET.tagName === 'A' && TARGET.href.startsWith('http')) {
    event.preventDefault();
    shell.openExternal(TARGET.href);
  }
});

ipcRenderer.on('show-pop-up-valid-session', (event, _connected_user_id, _user_with_session, _connected_user_file) => {
    showNotification({
        title: "Session verification",
        message: "Please enter your password.",
        type: "info",
        inputs: [
            { type: 'text', name: 'password', placeholder: 'Enter your password'}
        ],
        buttons: [
            { label: "Submit", action: (_password) => verify_session_is_correct(_password, _connected_user_id, _user_with_session, _connected_user_file)},
            { label: "Quit", action: () => alert("Quit") }
        ]
    });
});

function showNotification({
  title = "Notification",
  message = "",
  type = "info",
  inputs = [],
  buttons = [
    { label: "Close", action: null }
  ],
  autoClose = 0
}) {
  if (!document.getElementById('custom-notification-style')) {
    const style = document.createElement('style');
    style.id = 'custom-notification-style';
    style.textContent = `
      .popup-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeInOverlay 0.3s ease-in-out;
      }

      .popup {
        background: #2e3b47;
        border-radius: 10px;
        padding: 24px;
        max-width: 420px;
        width: 100%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        font-family: "Segoe UI", sans-serif;
        color: #fff;
        animation: popupSlideUp 0.35s ease-out;
      }

      .popup h2 {
        margin-top: 0;
        font-size: 1.3em;
        color: #42a5f5;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
      }

      .popup p {
        margin: 12px 0;
        font-size: 0.95em;
        color: #ddd;
      }

      .popup input,
      .popup textarea {
        width: 100%;
        padding: 10px;
        margin-top: 8px;
        margin-bottom: 14px;
        border: 1px solid #3a4a5e;
        border-radius: 4px;
        background-color: #1e2a38;
        color: #fff;
        font-size: 0.95em;
        transition: border 0.2s, box-shadow 0.2s;
      }

      .popup input:focus,
      .popup textarea:focus {
        outline: none;
        border: 2px solid #42a5f5;
        box-shadow: 0 0 10px rgba(66, 165, 245, 0.5);
      }

      .popup-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
      }

      .popup-buttons button {
        padding: 8px 16px;
        font-size: 0.9em;
        background-color: #42a5f5;
        color: white;
        border: none;
        border-radius: 4px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: background-color 0.2s, box-shadow 0.2s;
      }

      .popup-buttons button:hover {
        background-color: #1e88e5;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
      }

      .popup-buttons button:active {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      @keyframes popupSlideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeInOverlay {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .popup-info h2 { color: #42a5f5; }
      .popup-success h2 { color: #28a745; }
      .popup-error h2 { color: #f07178; }
      .popup-warning h2 { color: #ffc107; }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const popup = document.createElement('div');
  popup.className = `popup popup-${type}`;

  const titleElem = document.createElement('h2');
  titleElem.textContent = title;

  const messageElem = document.createElement('p');
  messageElem.textContent = message;

  popup.appendChild(titleElem);
  popup.appendChild(messageElem);

  const inputValues = {};
  for (const input of inputs) {
    let inputElem;

    if (input.type === 'textarea') {
      inputElem = document.createElement('textarea');
    } else {derive_key_from_password
      inputElem = document.createElement('input');
      inputElem.type = input.type || 'text';
    }

    inputElem.placeholder = input.placeholder || '';
    inputElem.name = input.name || '';

    inputValues[input.name] = '';
    inputElem.addEventListener('input', () => {
      inputValues[input.name] = inputElem.value;
    });

    popup.appendChild(inputElem);
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'popup-buttons';

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.label;
    button.onclick = () => {
      overlay.remove();
      if (typeof btn.action === 'function') {
        btn.action(inputValues);
      }
    };
    buttonContainer.appendChild(button);
  });

  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  if (autoClose > 0) {
    setTimeout(() => overlay.remove(), autoClose);
  }
}

async function verify_session_is_correct(_values, _connected_user_id, _user_with_session, _connected_user_file) {
   const PASSWORD_ENTERED = _values.password;

    if (_connected_user_id !== _user_with_session.user_id) {
        alert("An error has occurred. Please try again.");
        return;
    }

    const HASHED_PASSWORD = _user_with_session.password;
    const IS_VALID = await verify_password(HASHED_PASSWORD, PASSWORD_ENTERED);

    if (!IS_VALID) {
        showNotification({
            title: "Session verification",
            message: "Invalid password. Please try again.",
            type: "error",
            inputs: [
                { type: 'text', name: 'password', placeholder: 'Enter your password' }
            ],
            buttons: [
                { label: "Submit", action: (_password) => verify_password_is_correct(_password, _connected_user_id, _user_with_session, _connected_user_file) },
                { label: "Quit", action: () => alert("Quit") }
            ]
        });
        return;
    }

    try {
        const DERIVED_KEY_OBJECT = await derive_key_from_password(PASSWORD_ENTERED, _user_with_session.aes_salt);
        const DERIVED_KEY_BYTES = base64_to_bytes(DERIVED_KEY_OBJECT.key);

        const AES_KEY_ENCRYPTED_NONCE = _user_with_session.aes_key_encrypted.nonce;
        const AES_KEY_ENCRYPTED_CIPHER = _user_with_session.aes_key_encrypted.cipher;
        const AES_KEY_BASE64 = await decrypt_aes_256_gcm(AES_KEY_ENCRYPTED_NONCE, AES_KEY_ENCRYPTED_CIPHER, DERIVED_KEY_BYTES);

        const AES_KEY_BYTES = base64_to_bytes(AES_KEY_BASE64);

        if (!(AES_KEY_BYTES instanceof Uint8Array) || AES_KEY_BYTES.length !== 32) {
            alert("Error: AES key must be 32 bytes long. Got: " + AES_KEY_BYTES.length);
            return;
        }

        const DECRYPTED_SESSION_STRING = await decrypt_aes_256_gcm(_connected_user_file.nonce, _connected_user_file.cipher, AES_KEY_BYTES);

        const DECRYPTED_SESSION = JSON.parse(DECRYPTED_SESSION_STRING);
        const CURRENT_TIME = Date.now();
        const DATE_TO_EXPIRES = DECRYPTED_SESSION.connected_user.expires_at;
        if (DATE_TO_EXPIRES < CURRENT_TIME) {
          window.location.href = '../login/login.html';
        }
    } catch (error) {
        console.error("Decryption failed:", error);
        alert("An error occurred during session decryption.");
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