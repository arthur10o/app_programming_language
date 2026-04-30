export const translationBalise: string = 'data-i18n';
export const placeholderTranslationBalise: string = 'data-i18n-placeholder';

export type TranslationKey = string;
export type Translations = Record<TranslationKey, string>;
export type Language = 'en' | 'es' | 'fr';

export interface TranslationService {
    loadTranslation(lang: Language): Promise<void>;
    t(key: TranslationKey): string;
    tReplace(key: TranslationKey, replacements: Record<string, string | number>): string;
    waitForTranslations(): Promise<void>;
}