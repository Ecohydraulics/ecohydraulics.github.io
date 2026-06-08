/**
 * Unified language configuration file
 * All language-related maps and configuration are exported from here
 */

export interface LanguageConfig {
    /** Language code used by the translation service */
    translateCode: string;
    /** Language display name */
    displayName: string;
    /** Locale used by Intl.DateTimeFormat */
    locale: string;
    /** Language icon (flag emoji) */
    icon: string;
}

/**
 * Supported language configuration
 * Single source of truth, avoids duplicate definitions
 */
export const LANGUAGE_CONFIG = {
    en: {
        translateCode: "english",
        displayName: "English",
        locale: "en-US",
        icon: "🇬🇧",
    },
    zh: {
        translateCode: "chinese_simplified",
        displayName: "中文",
        locale: "zh-CN",
        icon: "🇨🇳",
    },
    de: {
        // translate.js client.edge keys German as "deutsch" (not "german"); see service map.
        translateCode: "deutsch",
        displayName: "Deutsch",
        locale: "de-DE",
        icon: "🇩🇪",
    },
    fr: {
        translateCode: "french",
        displayName: "Français",
        locale: "fr-FR",
        icon: "🇫🇷",
    },
    es: {
        translateCode: "spanish",
        displayName: "Español",
        locale: "es-ES",
        icon: "🇪🇸",
    },
    ar: {
        translateCode: "arabic",
        displayName: "العربية",
        locale: "ar-SA",
        icon: "🇸🇦",
    },
    he: {
        // translate.js (client.edge) keys Hebrew as "hebrew" -> serviceId "he".
        translateCode: "hebrew",
        displayName: "עברית",
        locale: "he-IL",
        icon: "🇮🇱",
    },
    ru: {
        translateCode: "russian",
        displayName: "Русский",
        locale: "ru-RU",
        icon: "🇷🇺",
    },
    sw: {
        translateCode: "swahili",
        displayName: "Kiswahili",
        locale: "sw-KE",
        icon: "🇰🇪",
    },
    tr: {
        translateCode: "turkish",
        displayName: "Türkçe",
        locale: "tr-TR",
        icon: "🇹🇷",
    },
    it: {
        translateCode: "italian",
        displayName: "Italiano",
        locale: "it-IT",
        icon: "🇮🇹",
    },
    hu: {
        translateCode: "hungarian",
        displayName: "Magyar",
        locale: "hu-HU",
        icon: "🇭🇺",
    },
    el: {
        translateCode: "greek",
        displayName: "Ελληνικά",
        locale: "el-GR",
        icon: "🇬🇷",
    },
    ja: {
        translateCode: "japanese",
        displayName: "日本語",
        locale: "ja-JP",
        icon: "🇯🇵",
    },
    pt: {
        translateCode: "portuguese",
        displayName: "Português",
        locale: "pt-PT",
        icon: "🇵🇹",
    },
    nl: {
        translateCode: "dutch",
        displayName: "Nederlands",
        locale: "nl-NL",
        icon: "🇳🇱",
    },
    no: {
        translateCode: "norwegian",
        displayName: "Norsk",
        locale: "nb-NO",
        icon: "🇳🇴",
    },
    sv: {
        translateCode: "swedish",
        displayName: "Svenska",
        locale: "sv-SE",
        icon: "🇸🇪",
    },
    pl: {
        translateCode: "polish",
        displayName: "Polski",
        locale: "pl-PL",
        icon: "🇵🇱",
    },
    hi: {
        translateCode: "hindi",
        displayName: "हिन्दी",
        locale: "hi-IN",
        icon: "🇮🇳",
    },
} as const satisfies Record<string, LanguageConfig>;

/** List of supported language codes */
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIG) as Array<
    keyof typeof LANGUAGE_CONFIG
>;

export type SupportedLanguage = keyof typeof LANGUAGE_CONFIG;

/**
 * Aliases for browser/OS language tags that should map onto a supported
 * language but whose *primary* subtag is not itself supported.
 *
 * Regional variants such as de-CH / de-AT (Swiss/Austrian German) and
 * fr-CH / fr-BE (Swiss/Belgian French) do NOT need entries here: detection
 * strips the region and matches on the primary subtag (de / fr) directly.
 * These entries cover the exceptions whose primary subtag differs from the
 * supported code — e.g. Swiss German's own ISO code "gsw".
 */
export const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
    gsw: "de", // Swiss German (Alemannic)
    swg: "de", // Swabian German
    bar: "de", // Bavarian / Austro-Bavarian
    iw: "he",  // legacy ISO 639 code for Hebrew (some older browsers/OSes)
};

/**
 * Map from config language code to translation-service language code
 * Auto-generated from LANGUAGE_CONFIG
 */
export const langToTranslateMap: Record<string, string> = Object.fromEntries(
    Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => [
        lang,
        config.translateCode,
    ]),
);

/**
 * Map from translation-service language code to config language code
 * Auto-generated from LANGUAGE_CONFIG
 */
export const translateToLangMap: Record<string, string> = Object.fromEntries(
    Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => [
        config.translateCode,
        lang,
    ]),
);

/**
 * Map from language code to locale
 * Auto-generated from LANGUAGE_CONFIG
 */
export const langToLocaleMap: Record<string, string> = Object.fromEntries(
    Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => [lang, config.locale]),
);

/**
 * Get the list of all translatable languages (used by Translator)
 */
export function getSupportedTranslateLanguages() {
    return Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
        code: config.translateCode,
        name: config.displayName,
        icon: config.icon,
        langCode: code,
    }));
}
