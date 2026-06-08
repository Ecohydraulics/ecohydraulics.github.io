import type {
    SYSTEM_MODE,
    DARK_MODE,
    LIGHT_MODE,
    WALLPAPER_FULLSCREEN,
    WALLPAPER_BANNER,
    WALLPAPER_NONE
} from "@constants/constants";


/**
 *
 */

// Analytics configuration
export type AnalyticsConfig = {
    enabled: boolean;
    platform: "umami";
    umami: {
        apiKey: string;
        baseUrl: string;
        code: string;
    };
};

/**
 *
 */

// Favicon configuration
export type Favicon = {
    src: string;
    theme?: "light" | "dark";
    sizes?: string;
};


// Loading overlay configuration
export type LoadingOverlayConfig = {
    // Whether to enable the loading overlay
    enable: boolean;
    // Whether to wait for all resources to load; if false, the overlay closes as soon as the DOM is parsed
    waitForAllResources: boolean;
    // Loading title configuration
    title: {
        // Whether to enable the loading title
        enable: boolean;
        // Loading title text
        content: string;
        // Animation cycle (s)
        interval: number;
    };
    // Loading spinner configuration
    spinner: {
        // Whether to enable the loading spinner
        enable: boolean;
        // Animation cycle (s)
        interval: number;
    };
};


// Site configuration
export type SiteConfig = {
    // Site URL (with trailing slash)
    siteURL: string;
    // Site title
    title: string;
    // Site subtitle
    subtitle: string;
    // Site keywords, used to generate <meta name="keywords">
    keywords?: string[];
    // Language
    lang: "en" | "zh" | "de" | "fr" | "es" | "ar" | "ru" | "sw" | "tr" | "it" | "hu" | "el" | "ja" | "pt" | "nl" | "no" | "sv" | "pl" | "hi";
    // Translation configuration
    translate?: {
        // Enable the translation feature
        enable: boolean;
        // Translation service type, e.g. 'client.edge'
        service?: string;
        // Show the language selector dropdown
        showSelectTag?: boolean;
        // Auto-detect the user's language
        autoDiscriminate?: boolean;
        // CSS class names to ignore when translating
        ignoreClasses?: string[];
        // HTML tags to ignore when translating
        ignoreTags?: string[];
    };
    // Time zone configuration
    timeZone: -12 | -11 | -10 | -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    // Font configuration
    font: {
        [key: string]: {
            // Font source (font CSS link | font file path)
            src: string;
            // Font name (font-family)
            family: string;
        };
    };
    // Theme color configuration
    themeColor: {
        // Default hue of the theme color (0-360)
        hue: number;
    };
    // Default theme
    defaultTheme: "system" | "light" | "dark";
    // Wallpaper configuration
    wallpaper: {
        // Mode
        mode: "fullscreen" | "banner" | "none";
        src: // Image source configuration (shared by fullscreen and banner modes)
        | string
        | string[]
        | {
            desktop?: string | string[];
            mobile?: string | string[];
        };
        // Wallpaper position, equivalent to object-position
        position?: "top" | "center" | "bottom";
        // Carousel configuration (shared by fullscreen and banner modes)
        carousel?: {
            // Enable the carousel for multiple images, otherwise show a random image
            enable: boolean;
            // Carousel interval (s)
            interval: number;
            // Enable the Ken Burns effect
            kenBurns?: boolean;
        };
        // Banner-mode-only configuration
        banner?: {
            homeText?: {
                // Show text on the home page
                enable: boolean;
                // Main title
                title?: string;
                // Subtitle
                subtitle?: string | string[]; // supports a single string or an array of strings
                // Subtitle typewriter effect
                typewriter?: {
                    // Enable the subtitle typewriter effect
                    enable: boolean;
                    // Typing speed (ms)
                    speed: number;
                    // Deleting speed (ms)
                    deleteSpeed: number;
                    // Pause time after fully displayed (ms)
                    pauseTime: number;
                };
            };
            // Banner image credit text
            credit?: {
                // Show the banner image credit text
                enable: boolean;
                // Credit text to display
                text: string;
                // (Optional) URL link to the original artwork or artist page
                url?: string;
            };
            // Navbar configuration
            navbar?: {
                // Navbar transparency mode
                transparentMode?: "semi" | "full" | "semifull";
            };
            // Water wave effect configuration
            waves?: {
                // Enable the water wave effect
                enable: boolean;
                // Enable performance mode (simplified wave effect for better performance)
                performanceMode?: boolean;
            };
        };
        // Fullscreen-mode-only configuration
        fullscreen?: {
            // z-index
            zIndex?: number;
            // Wallpaper opacity, between 0 and 1
            opacity?: number;
            // Background blur amount (px)
            blur?: number;
            // Navbar transparency mode
            navbar?: {
                transparentMode?: "semi" | "full" | "semifull";
            };
        };
    };
    // Loading overlay configuration
    loadingOverlay?: LoadingOverlayConfig;
    // Favicon configuration
    favicon: Favicon[];
    // Bangumi configuration
    bangumi?: {
        // User ID
        userId?: string;
    };
    // OpenGraph configuration
    generateOgImages: boolean;
};

/**
 *
 */

export type LIGHT_DARK_MODE =
    | typeof LIGHT_MODE
    | typeof DARK_MODE
    | typeof SYSTEM_MODE;


export type WALLPAPER_MODE =
    | typeof WALLPAPER_FULLSCREEN
    | typeof WALLPAPER_BANNER
    | typeof WALLPAPER_NONE;

/**
 *
 */

export enum LinkPreset {
    Home = 0,
    Archive = 1,
    Projects = 2,
    Skills = 3,
    Timeline = 4,
    Diary = 5,
    Albums = 6,
    Anime = 7,
    About = 8,
    Friends = 9,
}


export type NavbarLink = {
    // Link name
    name: string;
    // Link URL
    url: string;
    // Whether it is an external link
    external?: boolean;
    // Link icon
    icon?: string;
    // Landing-page description
    description?: string;
    // Child links, can be NavbarLink or LinkPreset
    children?: (NavbarLink | LinkPreset)[];
};


// Navbar configuration
export type NavbarConfig = {
    // Link configuration
    links: (NavbarLink | LinkPreset)[]; // supports multi-level menus
};

/**
 *
 */

export type WidgetComponentType =
    | "profile"
    | "announcement"
    | "directory"
    | "categories"
    | "tags"
    | "statistics"
    | "toc"
    | "custom";


export type WidgetComponentConfig = {
    // Component type
    type: WidgetComponentType;
    // Enable this component
    enable: boolean;
    // Component position
    position: "top" | "sticky"; // fixed top area or sticky area
    // Custom inline style
    style?: string;
    // Page visibility configuration
    visibility?: {
        // Match mode: 'include', 'exclude'
        mode: "include" | "exclude";
        // List of page path match rules (regex strings supported)
        paths: string[];
    };
    // Responsive configuration
    responsive?: {
        // Hide on the specified devices
        hidden?: ("mobile" | "tablet" | "desktop")[];
        // Collapse threshold
        collapseThreshold?: number;
    };
    // TOC depth (only used by the toc and categories components)
    depth?: number;
};


// Profile configuration
export type ProfileConfig = {
    // Avatar configuration
    avatar?: string;
    // Name
    name: string;
    // Bio
    bio?: string;
    // Link configuration
    links: {
        name: string;
        url: string;
        icon: string;
    }[];
};


// Announcement configuration
export type AnnouncementConfig = {
    // Announcement title
    title?: string;
    // Announcement content
    content: string;
    // Announcement type
    type?: "info" | "warning" | "success" | "error";
    // Announcement bar icon
    icon?: string;
    // Allow the user to close the announcement
    closable?: boolean;
    // Link configuration
    link?: {
        // Enable the link
        enable: boolean;
        // Link text
        text: string;
        // Link URL
        url: string;
        // Whether it is an external link
        external?: boolean;
    };
};


// Sidebar configuration
export type SidebarConfig = {
    // List of sidebar component configurations
    components: {
        left: WidgetComponentConfig[];
        right: WidgetComponentConfig[];
    };
};

/**
 *
 */

export type BlogPostData = {
    body: string;
    title: string;
    published: Date;
    description: string;
    tags: string[];
    draft?: boolean;
    image?: string;
    category?: string;
    pinned?: boolean;
    prevTitle?: string;
    prevSlug?: string;
    nextTitle?: string;
    nextSlug?: string;
};


// Post configuration
export type PostConfig = {
    // Post card configuration
    card: {
        // Cover configuration
        cover: {
            // Cover position ("left" | "right")
            side: "left" | "right";
            // Cover width
            width: string;
            // Whether to show text (title, tags, excerpt) on the cover
            showContent: boolean;
        };
        // Title size (Tailwind text size class, e.g. "text-3xl")
        titleSize: string;
    };
    // Show the "last modified" card
    showLastModified: boolean;
    // Code highlighting configuration
    expressiveCode: {
        // Theme
        theme: string;
    };
    // License configuration
    license: {
        // Enable the license
        enable: boolean;
        // License name
        name: string;
        // License URL
        url: string;
    };
    // Comment configuration
    comment: {
        // Enable the comment feature
        enable: boolean;
        // Twikoo comment system configuration
        twikoo?: {
            // Environment ID
            envId: string;
            // Region
            region?: string;
            // Language
            lang?: string;
        };
    };
};

/**
 *
 */

// Footer configuration
export type FooterConfig = {
    // Whether to enable footer HTML injection
    enable: boolean;
    // Custom HTML content, for adding ICP license numbers and similar info
    customHtml?: string;
};

/**
 *
 */

// Particle effect configuration
export type ParticleConfig = {
    // Enable the particle effect
    enable: boolean;
    // Number of particles
    particleNum: number;
    // Number of out-of-bounds wraps allowed per particle, -1 for infinite
    limitTimes: number;
    // Particle size configuration
    size: {
        // Minimum particle size multiplier
        min: number;
        // Maximum particle size multiplier
        max: number;
    };
    // Particle opacity configuration
    opacity: {
        // Minimum particle opacity
        min: number;
        // Maximum particle opacity
        max: number;
    };
    // Particle movement speed configuration
    speed: {
        // Horizontal movement speed
        horizontal: {
            // Minimum value
            min: number;
            // Maximum value
            max: number;
        };
        // Vertical movement speed
        vertical: {
            // Minimum value
            min: number;
            // Maximum value
            max: number;
        };
        // Rotation speed
        rotation: number;
        // Fade-out speed
        fadeSpeed: number;
    };
    // Particle z-index
    zIndex: number;
};

/**
 *
 */

export type MusicPlayerTrack = {
    // Index
    id: number | string;
    // Title
    title: string;
    // Artist
    artist: string;
    // Cover
    cover: string;
    // File path
    url: string;
    // Lyrics
    lrc?: string;
    // Duration
    duration: number;
};


// Music player configuration
export type MusicPlayerConfig = {
    // Enable the music player feature
    enable: boolean;
    // Default mode
    mode: "meting" | "local";
    // meting-mode-only configuration
    meting: {
        // Meting API URL
        meting_api: string;
        // Music platform
        server: "netease" | "tencent" | "kugou" | "baidu" | "kuwo";
        // Type
        type: "playlist" | "album" | "artist" | "song" | "search";
        // Resource ID
        id: string;
    };
    // local-mode-only configuration
    local: {
        // Playlist
        playlist: MusicPlayerTrack[];
    };
    // Whether to autoplay
    autoplay?: boolean;
};

/**
 *
 */

// Live2D mascot (pio) configuration
export type PioConfig = {
    // Enable the mascot
    enable: boolean;
    // Model file paths
    models?: string[];
    // Mascot position
    position?: "left" | "right";
    // Mascot width
    width?: number;
    // Mascot height
    height?: number;
    // Display mode
    mode?: "static" | "fixed" | "draggable";
    // Whether to hide on mobile devices
    hiddenOnMobile?: boolean;
    // Dialog configuration
    dialog?: {
        // Welcome message
        welcome?: string | string[];
        // Touch prompts
        touch?: string | string[];
        // Home page prompt
        home?: string;
        // Skin/outfit change prompts
        skin?: [string, string]; // [before switch, after switch]
        // Close prompt
        close?: string;
        // About link
        link?: string;
        // Custom attributes
        custom?: Array<{
            // CSS selector
            selector: string;
            // Type
            type: "read" | "link";
            // Custom text
            text?: string;
        }>;
    };
};
