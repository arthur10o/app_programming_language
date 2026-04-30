type UserId = string;
type Cipher = string
type Nonce = string;

type Theme = 'dark' | 'light';
type FontUnit = 'px' | 'em' | 'rem' | '%';
type FontFamily = 'Segoe UI' | 'monospace' | 'sans-serif' | 'serif';
type Language = 'en' | 'es' | 'fr';

interface ConnectedUser {
    cipher: Cipher;
    nonce: Nonce;
    userId: UserId;
};

interface SessionData {
    userID: UserId;
    token: string;
    dateOfConnection: number;
    dateOfExpiration: number;
};

interface EncryptedField {
    cipher: Cipher;
    nonc: Nonce;
};

interface FontSize {
    size: number;
    unit: FontSize;
};

interface EditorPreferences {
    theme: Theme;
    fontSize: FontSize;
    fontFamily: FontFamily;
    language: Language;
    autosave: boolean;
    tabulationSize: number;
    autoComplete: boolean;
    showSuggestions: boolean;
    syntaxHighlightings: boolean;
    showLineNumbers: boolean;
};

type KeybindingsAction = 
    | 'save file'
    | 'open file'
    | 'new file'
    | 'close file'
    | 'close ide'
    | 'comment line'
    | 'remove line'
    | 'toggle terminal'
    | 'toggle terminal (alternative)'
    | 'open settings'
    | 'open editor'
    | 'open home'
    | 'log out'
    | 'change account'
    | 'full screen'
    | 'find'
    | 'replace'
    | 'undo'
    | 'redo'
    | 'redo (alternative)'
    | 'run file'
    | 'go to definition'
    | 'debug'
    | 'step over'
    | 'step into'
    | 'step out'

interface Keybindings {
    [key: string]: KeybindingsAction;
};

interface User {
    userId: string,
    username: EncryptedField;
    email: EncryptedField;
    aesKeyEncrypted: EncryptedField;
    aesSalt: string;
    password: string;
    profilPicture?: string;
    dontShowMessageBehaviorCloseFile?: boolean | null;
    dontShowMessageBehaviorNewFile?: boolean | null;
    preferences: EditorPreferences;
    keybindings: Keybindings;
};