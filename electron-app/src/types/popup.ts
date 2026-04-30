export type PopupType = 'info' | 'success' | 'error' | 'warning';

export interface PopupInput {
    type: 'text' | 'textarea' | 'password';
    name: string;
    placeholder?: string;
}

export interface PopupButton {
    label: string;
    action: ((values: Record<string, string>) => void) | null;
}

export interface PopupOptions {
    title: string;
    message: string;
    type: PopupType;
    inputs?: PopupInput[];
    buttons?: PopupButton[];
    autoClose?: number;
}