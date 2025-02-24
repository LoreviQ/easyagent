import { createCookie } from "@remix-run/node";

// Cookie for storing user preferences
export const prefsCookie = createCookie("prefs");

export type PrefsCookie = {
    showSidebar?: boolean;
    narrowMode?: boolean;
};

export const DEFAULT_PREFS: PrefsCookie = {
    showSidebar: true,
    narrowMode: false,
};
