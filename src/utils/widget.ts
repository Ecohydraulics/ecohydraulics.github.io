import type {
    WidgetComponentConfig,
    WidgetComponentType,
    SidebarConfig,
} from "@/types/config";
import { sidebarConfig } from "@/config";


/**
 * Component map - maps each component type to its actual component path
 */
export const WIDGET_COMPONENT_MAP = {
    profile: "@components/sidebar/profile.astro",
    announcement: "@components/sidebar/announcement.astro",
    directory: "@components/sidebar/directory.astro",
    categories: "@components/sidebar/categories.astro",
    tags: "@components/sidebar/tags.astro",
    toc: "@components/sidebar/toc.astro",
    statistics: "@components/sidebar/statistics.astro",
    custom: null, // custom components must specify their path in the config
} as const;

/**
 * Widget manager class
 * Manages dynamic loading, ordering and rendering of sidebar components
 */
export class WidgetManager {
    private config: SidebarConfig;

    constructor(config: SidebarConfig = sidebarConfig) {
        this.config = config;
    }

    /**
     * Get the configuration
     */
    getConfig(): SidebarConfig {
        return this.config;
    }

    /**
     * Check whether the component is visible on the current page and device
     * @param component component configuration
     * @param currentPath current page path
     * @param deviceType device type: 'mobile' | 'tablet' | 'desktop'
     */
    isVisible(component: WidgetComponentConfig, currentPath?: string, deviceType?: 'mobile' | 'tablet' | 'desktop'): boolean {
        // Check the responsive hidden configuration
        if (deviceType && component.responsive?.hidden?.includes(deviceType)) {
            return false;
        }
        // Check page path visibility
        return this.shouldShowComponent(component, currentPath);
    }

    /**
     * Check whether the component is visible on the current page
     * @param component component configuration
     * @param currentPath current page path
     */
    shouldShowComponent(component: WidgetComponentConfig, currentPath?: string): boolean {
        if (!component.visibility || !currentPath) {
            return true;
        }
        const { mode, paths } = component.visibility;
        // Ensure the path starts with / for easier matching
        let normalizedPath = currentPath.startsWith('/') ? currentPath : '/' + currentPath;
        // Remove the trailing slash (keep it if it is the root path /)
        if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }
        
        const matches = paths.some((pattern) => {
            try {
                return new RegExp(pattern).test(normalizedPath);
            } catch (e) {
                console.warn(`Invalid regex pattern in component visibility config: ${pattern}`, e);
                return false;
            }
        });

        if (mode === "include") {
            return matches;
        }
        if (mode === "exclude") {
            return !matches;
        }
        return true;
    }

    /**
     * Get the list of components on the specified sidebar
     * @param side sidebar position: 'left' | 'right'
     * @param currentPath current page path (optional, used for filtering)
     */
    getComponentsBySide(side: "left" | "right", currentPath?: string): WidgetComponentConfig[] {
        const components = this.config.components[side] || [];
        if (currentPath) {
            return components.filter(c => this.shouldShowComponent(c, currentPath));
        }
        return components;
    }

    /**
     * Get the list of components by position
     * @param position component position: 'top' | 'sticky'
     * @param currentPath current page path (optional, used for filtering)
     */
    getComponentsByPosition(position: "top" | "sticky", currentPath?: string): WidgetComponentConfig[] {
        const left = this.getComponentsBySideAndPosition("left", position, currentPath);
        const right = this.getComponentsBySideAndPosition("right", position, currentPath);
        // Note: This might return duplicates if left/right logic overlaps, but used for enabled types check
        return [...left, ...right];
    }

    /**
     * Get the list of components by sidebar and position
     * @param side sidebar position: 'left' | 'right' | 'middle'
     * @param position component position: 'top' | 'sticky'
     * @param currentPath current page path (optional, used for filtering)
     */
    getComponentsBySideAndPosition(
        side: "left" | "right" | "middle",
        position: "top" | "sticky",
        currentPath?: string,
    ): WidgetComponentConfig[] {
        const leftComponents = (this.config.components.left || [])
            .filter(c => c.position === position)
            .filter(c => this.shouldShowComponent(c, currentPath));
        const rightComponents = (this.config.components.right || [])
            .filter(c => c.position === position)
            .filter(c => this.shouldShowComponent(c, currentPath));

        if (side === "left") {
            // Left sidebar includes Right components on Tablet (merged)
            return [...leftComponents, ...rightComponents];
        }
        
        if (side === "right") {
            // Right sidebar only shows Right components (Desktop only)
            return rightComponents;
        }

        if (side === "middle") {
            // Middle sidebar includes all components
            return [...leftComponents, ...rightComponents];
        }

        return [];
    }

    /**
     * Get the CSS class names of the component
     * @param component component configuration
     * @param index the component's index in the list
     * @param side the sidebar position currently being rendered
     */
    getComponentClass(component: WidgetComponentConfig, index: number, side: "left" | "right" | "middle"): string {
        const classes: string[] = [];

        // Base responsive hidden config (user-configured)
        if (component.responsive?.hidden) {
            component.responsive.hidden.forEach((device) => {
                switch (device) {
                    case "mobile":
                        classes.push("hidden md:block");
                        break;
                    case "tablet":
                        classes.push("md:hidden lg:block");
                        break;
                    case "desktop":
                        classes.push("lg:hidden");
                        break;
                }
            });
        }

        // Automatic layout logic
        const isFromLeft = (this.config.components.left || []).includes(component);
        const isFromRight = (this.config.components.right || []).includes(component);

        if (side === "left") {
            if (isFromRight && !isFromLeft) {
                // If a right-side component is rendered in the left sidebar (tablet mode), show it only on tablet
                classes.push("hidden md:block lg:hidden");
            }
            // Left-side components are shown by default
        }

        return classes.join(" ");
    }

    /**
     * Get the inline style of the component
     * @param component component configuration
     * @param index the component's index in the list
     */
    getComponentStyle(component: WidgetComponentConfig, index: number): string {
        const styles: string[] = [];

        // Add custom styles
        if (component.style) {
            styles.push(component.style);
        }

        return styles.join("; ");
    }

    /**
     * Check whether the component should be collapsed
     * @param component component configuration
     * @param itemCount number of content items in the component
     */
    isCollapsed(component: WidgetComponentConfig, itemCount: number): boolean {
        if (!component.responsive?.collapseThreshold) {
            return false;
        }
        return itemCount >= component.responsive.collapseThreshold;
    }

    /**
     * Get the component's path
     * @param componentType component type
     */
    getComponentPath(componentType: WidgetComponentType): string | null {
        return WIDGET_COMPONENT_MAP[componentType];
    }

    /**
     * Check whether the specified sidebar has actual displayable content
     * @param side sidebar position: 'left' | 'right'
     * @param headings list of page headings, used to decide whether special components are shown
     * @param currentPath current page path (optional, used for filtering)
     */
    hasContentOnSide(side: "left" | "right", headings: any[] = [], currentPath?: string): boolean {
        const components = this.getComponentsBySide(side, currentPath);
        if (components.length === 0) return false;

        // As long as one component can display content, the sidebar is not empty
        return components.some((component) => {
            // The TOC component only shows when there are headings
            if (component.type === "toc") {
                return headings && headings.length > 0;
            }
            // Other components are assumed to always have content for now
            return true;
        });
    }

    /**
     * Update the component configuration
     * @param newConfig the new configuration
     */
    updateConfig(newConfig: Partial<SidebarConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Add a new component
     * @param component component configuration
     * @param side sidebar position
     */
    addComponent(component: WidgetComponentConfig, side: "left" | "right"): void {
        if (!this.config.components[side]) {
            this.config.components[side] = [];
        }
        this.config.components[side].push(component);
    }

    /**
     * Remove a component
     * @param componentType component type
     */
    removeComponent(componentType: WidgetComponentType): void {
        if (this.config.components.left) {
            this.config.components.left = this.config.components.left.filter(
                (component) => component.type !== componentType,
            );
        }
        if (this.config.components.right) {
            this.config.components.right = this.config.components.right.filter(
                (component) => component.type !== componentType,
            );
        }
    }

    /**
     * Reorder components
     * @param side sidebar
     * @param oldIndex old index
     * @param newIndex new index
     */
    reorderComponent(side: "left" | "right", oldIndex: number, newIndex: number): void {
        const list = this.config.components[side];
        if (!list) return;
        
        if (oldIndex >= 0 && oldIndex < list.length && newIndex >= 0 && newIndex < list.length) {
            const [moved] = list.splice(oldIndex, 1);
            list.splice(newIndex, 0, moved);
        }
    }

    /**
     * Check whether the component should be rendered in the sidebar
     * @param componentType component type
     */
    isSidebarComponent(componentType: WidgetComponentType): boolean {
        return true;
    }

    /**
     * Get the list of headings on the page
     * @returns the formatted array of headings
     */
    getPageHeadings() {
        if (typeof document === "undefined") return [];
        return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
            .filter((h) => h.id)
            .map((h) => ({
                depth: parseInt(h.tagName.substring(1)),
                slug: h.id,
                text: (h.textContent || "").replace(/#+\s*$/, ""),
            }));
    }

    /**
     * Get the class names related to the grid layout
     * @param headings list of page headings
     * @param currentPath current page path (optional, used for filtering)
     */
    getGridLayout(headings: any[] = [], currentPath?: string) {
        const hasLeftComponents = this.hasContentOnSide("left", headings, currentPath);
        const hasRightComponents = this.hasContentOnSide("right", headings, currentPath);
        const hasAnyComponents = hasLeftComponents || hasRightComponents;

        // Desktop: Left if hasLeft, Right if hasRight
        const hasLeftSidebar = hasLeftComponents;
        const hasRightSidebar = hasRightComponents;

        // Dynamic grid layout class names
        const gridCols = `
            grid-cols-1
            ${hasAnyComponents ? "md:grid-cols-[17.5rem_1fr]" : "md:grid-cols-1"}
            ${
                hasLeftSidebar && hasRightSidebar
                    ? "lg:grid-cols-[17.5rem_1fr_17.5rem]"
                    : hasLeftSidebar
                        ? "lg:grid-cols-[17.5rem_1fr]"
                        : hasRightSidebar
                            ? "lg:grid-cols-[1fr_17.5rem]"
                            : "lg:grid-cols-1"
            }
        `.trim().replace(/\s+/g, " ");

        // Left sidebar container class names
        // Mobile: Hidden
        // Tablet: Visible if hasAnyComponents (merged)
        // Desktop: Visible if hasLeftSidebar
        const leftSidebarClass = `
            mb-0 col-span-1 hidden min-w-0
            ${hasAnyComponents ? "md:flex md:flex-col md:max-w-70" : ""}
            ${hasLeftSidebar ? "lg:flex lg:flex-col lg:max-w-70 lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" : "lg:hidden"}
        `.trim().replace(/\s+/g, " ");

        // Right sidebar container class names
        // Mobile: Hidden
        // Tablet: Hidden
        // Desktop: Visible if hasRightSidebar
        const rightSidebarClass = `
            mb-0 col-span-1 hidden min-w-0
            md:hidden
            ${
                hasRightSidebar
                    ? hasLeftSidebar
                        ? "lg:flex lg:flex-col lg:max-w-70 lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
                        : "lg:flex lg:flex-col lg:max-w-70 lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
                    : "lg:hidden"
            }
        `.trim().replace(/\s+/g, " ");

        // Mobile footer class names
        // Always 1 col on mobile
        // 2 cols on tablet if sidebar is present
        const mobileFooterClass = `
            footer col-span-1 onload-animation-up block lg:hidden transition-swup-fade
            ${hasAnyComponents ? "md:col-span-2" : "md:col-span-1"}
        `.trim().replace(/\s+/g, " ");
        
        // Mobile sidebar class names
        const middleSidebarClass = `
            min-w-0 col-span-1 flex flex-col md:hidden
            ${!hasAnyComponents ? "hidden" : ""}
        `.trim().replace(/\s+/g, " ");

        // Main content area class names
        const mainContentClass = `
            overflow-hidden w-full
            col-span-1 row-start-1 row-end-2
            ${hasAnyComponents ? "md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-2" : "md:col-span-1"}
            ${
                hasLeftSidebar && hasRightSidebar
                    ? "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
                    : hasLeftSidebar
                        ? "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
                        : hasRightSidebar
                            ? "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
                            : "lg:col-span-1"
            }
        `.trim().replace(/\s+/g, " ");

        return {
            hasLeftSidebar,
            hasRightSidebar,
            hasAnyComponents,
            gridCols,
            leftSidebarClass,
            rightSidebarClass,
            mainContentClass,
            mobileFooterClass,
            middleSidebarClass,
        };
    }
}

/**
 * Default widget manager instance
 */
export const widgetManager = new WidgetManager();

/**
 * Utility function: get component config by component type
 * @param componentType component type
 */
export function getComponentConfig(
    componentType: WidgetComponentType,
): WidgetComponentConfig | undefined {
    const left = widgetManager.getConfig().components.left || [];
    const right = widgetManager.getConfig().components.right || [];
    return left.find((c) => c.type === componentType) ||
           right.find((c) => c.type === componentType);
}

/**
 * Utility function: check whether a component is enabled
 * @param componentType component type
 */
export function isComponentEnabled(
    componentType: WidgetComponentType,
): boolean {
    // By default, any component present in the config is considered enabled
    return !!getComponentConfig(componentType);
}

/**
 * Utility function: get all enabled component types
 */
export function getEnabledComponentTypes(): WidgetComponentType[] {
    const enabledComponents = widgetManager.getComponentsByPosition("top").concat(
        widgetManager.getComponentsByPosition("sticky")
    );
    return enabledComponents.map((c) => c.type);
}

/**
 * Generic click-outside close handler
 * @param event mouse event
 * @param panelId panel ID
 * @param ignoreIds element IDs to ignore (buttons etc.); accepts a single ID or an array of IDs
 * @param action close callback
 */
export function onClickOutside(
    event: MouseEvent,
    panelId: string,
    ignoreIds: string | string[],
    action: () => void
) {
    if (typeof document === "undefined") {
        return;
    }
    const panel = document.getElementById(panelId);

    const target = event.target as HTMLElement;

    const ids = Array.isArray(ignoreIds) ? ignoreIds : [ignoreIds];
    
    // If the click is on an ignored element or its descendant, do not close
    for (const id of ids) {
        if (target.closest(`#${id}`)) {
            return;
        }
    }

    // If the panel exists and the click occurred outside it, close
    if (panel && !panel.contains(target)) {
        action();
    }
}