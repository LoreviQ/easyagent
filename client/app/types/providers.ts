import { GithubIcon, GoogleIcon } from "~/components/icons";
import type { FC } from "react";

export interface ProviderDetails {
    id: string;
    name: string;
    icon?: FC<{ className?: string }>;
    colour?: string;
    hoverColour?: string;
    text?: string;
}
export const PROVIDERS: ProviderDetails[] = [
    {
        id: "github",
        name: "GitHub",
        icon: GithubIcon,
        colour: "#24292F",
        hoverColour: "#1B1F23",
        text: "#FFFFFF"
    },
    {
        id: "google",
        name: "Google",
        icon: GoogleIcon,
        colour: "#ffffff",
        hoverColour: "#e9e9e9",
        text: "#000000"
    }
];