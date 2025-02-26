import { GithubIcon, GoogleIcon, DiscordIcon, FacebookIcon, TwitchIcon, TwitterIcon } from "~/components/icons";
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
        id: "discord",
        name: "Discord",
        icon: DiscordIcon,
        colour: "#5865F2",
        hoverColour: "#4651c2",
        text: "#FFFFFF"
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: FacebookIcon,
        colour: "#1877F2",
        hoverColour: "#166FE5",
        text: "#FFFFFF"
    },
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
    },
    {
        id: "twitch",
        name: "Twitch",
        icon: TwitchIcon,
        colour: "#9144FE",
        hoverColour: "#7436cb",
        text: "#FFFFFF"
    },
    {
        id: "twitter",
        name: "X",
        icon: TwitterIcon,
        colour: "#000000",
        hoverColour: "#191919",
        text: "#FFFFFF"
    }
];