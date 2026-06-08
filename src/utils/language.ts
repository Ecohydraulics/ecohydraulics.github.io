import {
    type SupportedLanguage,
    SUPPORTED_LANGUAGES,
    LANGUAGE_ALIASES,
    langToTranslateMap,
    translateToLangMap,
    LANGUAGE_CONFIG,
} from "@i18n/language";
import {
    siteConfig,
} from "@/config";


// Re-export for backward compatibility
export { SUPPORTED_LANGUAGES, type SupportedLanguage, langToTranslateMap, translateToLangMap };


// Language storage key
const LANG_STORAGE_KEY = "selected-language";

// Store the language setting
export function setStoredLanguage(lang: string): void {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
}

// Get the stored language setting
export function getStoredLanguage(): string | null {
    if (typeof localStorage !== "undefined") {
        return localStorage.getItem(LANG_STORAGE_KEY);
    }
    return null;
}

// Get the default language configuration
export function getDefaultLanguage(): string {
    const fallback = siteConfig.lang;
    if (typeof document !== "undefined") {
        const configCarrier = document.getElementById("config-carrier");
        return configCarrier?.dataset.lang || fallback;
    }
    return fallback;
}

// Convert a config language code to a translation-service language code
export function getTranslateLanguageFromConfig(configLang: string): string {
    return langToTranslateMap[configLang] || "chinese_simplified";
}

// Get the resolved site language code
export function getResolvedSiteLang(): SupportedLanguage {
    const configLang = getDefaultLanguage() as any;
    if (SUPPORTED_LANGUAGES.includes(configLang)) {
        return configLang as SupportedLanguage;
    }
    // If siteConfig.lang is invalid, use the browser-detected language
    return detectBrowserLanguage();
}

// Convert a translation-service language code to a config language code
export function getConfigLanguageFromTranslate(translateLang: string): string {
    return translateToLangMap[translateLang] || "zh";
}

// Get the display name of a language
export function getLanguageDisplayName(langCode: string): string {
    // First try to look it up as a config language code
    if (langCode in LANGUAGE_CONFIG) {
        return LANGUAGE_CONFIG[langCode as SupportedLanguage].displayName;
    }
    // Try to look it up as a translation-service code
    const configLang = translateToLangMap[langCode];
    if (configLang && configLang in LANGUAGE_CONFIG) {
        return LANGUAGE_CONFIG[configLang as SupportedLanguage].displayName;
    }
    // If neither is found, return the original code
    return langCode;
}

// Detect the browser language and return a supported language code
export function detectBrowserLanguage(fallbackLang: SupportedLanguage = "en"): SupportedLanguage {
    // Return the fallback language during server-side rendering
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return fallbackLang;
    }
    // Get the browser language list
    const browserLangs = navigator.languages || [navigator.language];
    // Iterate the browser language list and find the first supported language
    for (const browserLang of browserLangs) {
        // Extract the primary language code (e.g. 'zh-CN' -> 'zh', 'en-US' -> 'en')
        // Regional variants are merged here automatically: de-CH / de-AT -> de, fr-CH / fr-BE -> fr
        const langCode = browserLang.toLowerCase().split("-")[0];
        // Check whether it is in the supported language list
        if (SUPPORTED_LANGUAGES.includes(langCode as SupportedLanguage)) {
            return langCode as SupportedLanguage;
        }
        // The primary language itself is unsupported, but merge it into the corresponding language when an alias mapping exists
        // (e.g. Swiss German 'gsw' -> de, legacy Hebrew code 'iw' -> he)
        if (langCode in LANGUAGE_ALIASES) {
            return LANGUAGE_ALIASES[langCode];
        }
    }
    // If no supported language is found, return the fallback language
    return fallbackLang;
}

// Get the current site language (prefer the cache, then the browser/OS UI language, then the config default)
// First visit (no stored choice) follows the visitor's browser/OS UI language
// from navigator.languages — the browser's language-preference list, which is
// the UI/content language, NOT the locale/region formatting settings.
export function getSiteLanguage(configLang?: string): string {
    // Read from the cache first: a language the user manually selected always takes priority
    const storedLang = getStoredLanguage();
    if (storedLang) return storedLang;
    // The site default language is the fallback for browser detection (used when the browser language is unsupported)
    const defaultLang = configLang || getDefaultLanguage();
    const fallbackLang = SUPPORTED_LANGUAGES.includes(defaultLang as SupportedLanguage)
        ? (defaultLang as SupportedLanguage)
        : "en";
    // Auto-detect the browser/OS UI language; fall back to the site default when unsupported
    const browserLang = detectBrowserLanguage(fallbackLang);
    return langToTranslateMap[browserLang];
}

// Gender-neutral / preferred custom translation terms, keyed by translate.js
// target-language code. translate.js machine-translates English at runtime, so
// these force specific wordings (e.g. inclusive role nouns) instead of the
// default gendered output. German uses neutral participles (Forschende, ...);
// French and Spanish use inclusive doublets. Each entry is "english=target".
const CUSTOM_TRANSLATION_TERMS: Record<string, string> = {
    // English -> German
    deutsch: `
researchers=Forschende
researcher=forschende Person
practitioners=Praktizierende
practitioner=praktizierende Person
scientists=Forschende
scientist=forschende Person
website=Webseite
Website=Webseite
the people=Menschen
`,
    // English -> French
    french: `
researchers=chercheuses et chercheurs
researcher=chercheuse ou chercheur
practitioners=praticiennes et praticiens
practitioner=praticienne ou praticien
scientists=scientifiques
scientist=scientifique
`,
    // English -> Spanish
    spanish: `
researchers=investigadoras e investigadores
researcher=persona investigadora
practitioners=profesionales
practitioner=profesional
scientists=científicas y científicos
scientist=persona científica
`,
};

// Register the custom term dictionary with translate.js. Must run before
// translate.execute() so the overrides apply on the first render; the data
// persists on the translate object, so later language switches use it too.
function registerCustomTranslationTerms(translate: any, sourceLang: string): void {
    if (!translate?.nomenclature?.append) return;
    for (const [targetLang, properties] of Object.entries(CUSTOM_TRANSLATION_TERMS)) {
        translate.nomenclature.append(sourceLang, targetLang, properties);
    }
}

// Initialize the translation feature
export function initTranslateService(): void {
    if (typeof window === "undefined" || !siteConfig.translate?.enable) return;
    // Check whether translate.js has already been loaded
    const translate = (window as any).translate;
    if (!translate || (window as any).translateInitialized) return;
    // Configure translate.js
    if (siteConfig.translate.service) {
        translate.service.use(siteConfig.translate.service);
    }
    // Set the source language (always the language the site is rendered in)
    const resolvedLang = getResolvedSiteLang();
    const sourceLang = getTranslateLanguageFromConfig(resolvedLang);
    translate.language.setLocal(sourceLang);
    // Get the target language (cache -> config -> browser)
    const targetLang = getSiteLanguage(resolvedLang);
    // If the target language differs from the source language, set the target language
    if (targetLang && targetLang !== sourceLang) {
        translate.to = targetLang;
    }
    // Auto-detect the language
    if (siteConfig.translate.autoDiscriminate) {
        translate.setAutoDiscriminateLocalLanguage();
    }
    // Set the ignore list
    if (siteConfig.translate.ignoreClasses) {
        siteConfig.translate.ignoreClasses.forEach((className: string) => {
            translate.ignore.class.push(className);
        });
    }
    if (siteConfig.translate.ignoreTags) {
        siteConfig.translate.ignoreTags.forEach((tagName: string) => {
            translate.ignore.tag.push(tagName);
        });
    }
    // UI configuration
    if (siteConfig.translate.showSelectTag === false) {
        translate.selectLanguageTag.show = false;
    }
    // Take over the storage logic: use a custom cache and sync it to translate.js
    translate.storage.set = function (key: string, value: string) {
        if (key === "to") { // translate.js uses "to" to store the target language
            setStoredLanguage(value);
        } else {
            localStorage.setItem(key, value);
        }
    };
    translate.storage.get = function (key: string) {
        if (key === "to") {
            return getStoredLanguage();
        }
        return localStorage.getItem(key);
    };
    // Register gender-neutral / preferred custom translation terms
    registerCustomTranslationTerms(translate, sourceLang);
    // Start the translation listener
    translate.listener.start();
    (window as any).translateInitialized = true;
    // If a target language exists and it is not the source language, run the translation
    // Force one execute to ensure the translation is applied on initialization
    if (translate.to && translate.to !== translate.language.getLocal()) {
        // Delay execution slightly to ensure the DOM is fully ready
        setTimeout(() => {
            translate.execute();
        }, 10);
    } else if (translate.to === translate.language.getLocal()) {
        // If the target language is the source language, ensure it stays untranslated
        // Sometimes the plugin may retain a previous translation state
        translate.reset();
    }
}

// Load and initialize the translation feature
export async function loadAndInitTranslate(): Promise<void> {
    if (typeof window === "undefined" || !siteConfig.translate?.enable) return;
    try {
        // Check whether it has already been loaded
        if (!(window as any).translate) {
            // Use a dynamic import; Vite handles code splitting automatically
            await import("@/plugins/translate");
            (window as any).translateScriptLoaded = true;
        }
        // Initialize the service
        initTranslateService();
    } catch (error) {
        console.error('Failed to load or init translate.js:', error);
    }
}

// Switch the language
export function toggleLanguage(langCode: string): void {
    const translate = (window as any).translate;
    if (!translate) return;
    // Switch the language
    translate.changeLanguage(langCode);
    setStoredLanguage(langCode);
}