import { PopupOptions, PopupInput, PopupButton } from "../types/popup";
import { tranlationManager } from "./translation";

export class PopupManager {
    private static instance: PopupManager;
    private static styleInjected = false;

    private constructor() {};

    public static getInstance(): PopupManager {
        if (!PopupManager.instance) PopupManager.instance = new PopupManager();
        return PopupManager.instance;
    }

    showNotification(options: PopupOptions): void {
        if (!PopupManager.styleInjected) {
            this.injectStyles();
            PopupManager.styleInjected = true;
        }
        const overlay = this.createOverlay();
        const popup = this.createPopup(options);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        if (options.autoClose && options.autoClose > 0) {
            setTimeout(() => this.closePopup(overlay, popup), options.autoClose);
        }
    }

    private injectStyles(): void {
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
                overflow-wrap: break-word;
                word-break: break-word;
            }

            .popup.fade-out {
                animation: popupSlideDown 0.3s forwards;
            }

            .popup-overlay.fade-out {
                animation: fadeOutOverlay 0.3s forwards;
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
                word-wrap: break-word;
                word-break: break-word;
                white-space: pre-wrap;
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

            @keyframes popupSlideDown {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(30px); }
            }

            @keyframes fadeOutOverlay {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            .popup-info h2 { color: #42a5f5; }
            .popup-success h2 { color: #28a745; }
            .popup-error h2 { color: #f07178; }
            .popup-warning h2 { color: #ffc107; }
        `
        document.head.appendChild(style);
    }

    private createOverlay(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        return overlay;
    }

    private createPopup(options: PopupOptions): HTMLDivElement {
        const popup = document.createElement('div');
        popup.className = `popup popup-${options.type}`;
        const titleElement = document.createElement('h2');
        titleElement.textContent = tranlationManager.t(options.title);
        popup.appendChild(titleElement);
        const messageElement = document.createElement('p');
        messageElement.textContent = tranlationManager.t(options.message);
        popup.appendChild(messageElement);
        const inputValues: Record<string, string> = {};
        options.inputs?.forEach((input) => {
            const inputElement = this.createInput(input);
            inputValues[input.name] = '';
            inputElement.addEventListener('input', () => {
                inputValues[input.name] = inputElement.value;
            });
            popup.appendChild(inputElement);
        });
        const buttonContainer = this.createButtonContainer(options.buttons || [], inputValues, popup);
        popup.appendChild(buttonContainer);
        return popup;
    }

    private createInput(input: PopupInput): HTMLInputElement | HTMLTextAreaElement {
        let inputElement: HTMLInputElement | HTMLTextAreaElement;
        if (input.type == 'textarea') inputElement = document.createElement('textarea');
        else {
            inputElement = document.createElement('input');
            inputElement.type = input.type || 'text';
        }
        inputElement.placeholder = tranlationManager.t(input.placeholder || '');
        inputElement.name = input.name;
        inputElement.spellcheck = false;
        return inputElement;
    }

    private createButtonContainer(
        buttons: PopupButton[],
        inputValue: Record<string, string>,
        popup: HTMLDivElement
    ): HTMLDivElement {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'popup-buttons';
        buttons.forEach((b) => {
            const button = document.createElement('button');
            button.onclick = () => {
                popup.classList.add('fade-out');
                const overlay = popup.parentElement as HTMLDivElement;
                overlay.classList.add('fade-out');
                popup.addEventListener('animationend', () => {
                    overlay.remove();
                    if (typeof b.action == 'function') {
                        b.action(inputValue);
                    }
                },
                { once: true });
            };
            buttonContainer.appendChild(button);
        });
        return buttonContainer;
    }

    private closePopup(overlay: HTMLDivElement, popup: HTMLDivElement): void {
        popup.classList.add('fade-out');
        overlay.classList.add('fade-out');
        popup.addEventListener('animationend', () =>  overlay.remove(), { once: true});
    }
}

export const popupManager = PopupManager.getInstance();