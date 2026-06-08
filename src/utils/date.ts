import { langToLocaleMap } from "@i18n/language";
import { getDefaultLanguage } from "./language";


export function formatDateToYYYYMMDD(date: Date): string {
    return date.toISOString().substring(0, 10);
}

// Internationalized date formatting function
export function formatDateI18n(dateString: string): string {
    const date = new Date(dateString);
    const lang = getDefaultLanguage();

    // Set different date formats based on the language
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    // Get the locale using the unified language configuration
    const locale = langToLocaleMap[lang] || "en-US";
    return date.toLocaleDateString(locale, options);
}