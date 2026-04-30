import { TranslationKey, Translations, Language, TranslationService, translationBalise, placeholderTranslationBalise } from "../types/translation";

export class TranslationManager implements TranslationService {
    private translations: Translations = {};
    private translationsLoaded = false;

    async loadTranslation(lang: Language): Promise<void> {
        try {
            const response = await fetch(`../../data/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for language "${lang}"`);
            }
            this.translations = await response.json();
            this.translationsLoaded = true;
            this.updateDomTranslations();
        } catch (err) {
            console.error(`Translation loading failed for language "${lang}"`, err);
            this.translationsLoaded = false;
        }
    }

    t(key: TranslationKey): string {
        return this.translations[key] || key;
    }

    tReplace(key: TranslationKey, replacements: Record<string, string | number>): string {
        let text = this.t(key);
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
        }
        return text;
    }

    async waitForTranslations(): Promise<void> {
        while (!this.translationsLoaded) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
    }

    private updateDomTranslations(): void {
        document.querySelectorAll(`[${translationBalise}]`).forEach((element) => {
            const key = element.getAttribute(translationBalise);
            if (key && this.translations[key]) element.textContent = this.translations[key];
        });

        document.querySelectorAll(`[${placeholderTranslationBalise}]`).forEach((element) => {
            const key = element.getAttribute(placeholderTranslationBalise);
            if (key && this.translations[key]) (element as HTMLInputElement).placeholder = this.translations[key];
        });
    }
}

export const tranlationManager = new TranslationManager();