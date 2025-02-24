import { createContext, useContext, useState } from "react";
import { useFetcher } from "@remix-run/react";

import type { PrefsCookie } from "~/utils/cookies";

type PreferencesContextType = {
    preferences: PrefsCookie;
    updatePreference: (key: keyof PrefsCookie, value: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ initial, children }: { initial: PrefsCookie; children: React.ReactNode }) {
    const [preferences, setPreferences] = useState<PrefsCookie>(initial);
    const fetcher = useFetcher();

    const updatePreference = (key: keyof PrefsCookie, value: boolean) => {
        // Optimistically update the UI
        setPreferences((prev) => ({ ...prev, [key]: value }));

        // Use fetcher to update the server
        const formData = new FormData();
        formData.append(key, String(value));
        fetcher.submit(formData, {
            method: "post",
            action: "/updatePreferences",
        });
    };

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreference }}>{children}</PreferencesContext.Provider>
    );
}

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error("usePreferences must be used within PreferencesProvider");
    return context;
};
