import type { MetaFunction } from "@remix-run/node";
import { Hero, FeatureCard } from "~/components/cards";
import { CoinIcon, BuildingIcon, VerifiedIcon } from "~/components/icons";

export const meta: MetaFunction = () => {
    return [
        { title: "EasyAgent - Seamlessly create AI Agents" },
        {
            name: "description",
            content:
                "Discover EasyAgent's AI Agents to automate your work.",
        },
    ];
};

export default function Index() {
    return (
        <div className="min-h-screen bg-theme-bg text-theme-text">
            <Hero />
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <FeatureCard
                    header="Personality Mirroring"
                    description="Engage in the web3 exosystem with our crypto plugins."
                    icon={<CoinIcon className="w-6 h-6 text-theme-primary" />}
                    iconBgColor="bg-theme-primary/20"
                />
                <FeatureCard
                    header="Multi-Platform Integration"
                    description="Explore our vibrant community of user created agents and plugins."
                    icon={<BuildingIcon className="w-6 h-6 text-theme-accent" />}
                    iconBgColor="bg-theme-accent/20"
                />
                <FeatureCard
                    header="Full Customization"
                    description="Control exactly how your AI behaves, what it posts, when it posts and where it posts."
                    icon={<VerifiedIcon className="w-6 h-6 text-theme-success" />}
                    iconBgColor="bg-theme-success/20"
                />
            </div>
        </div>
    );
}
