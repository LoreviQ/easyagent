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
        <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 text-white">
            <Hero />
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <FeatureCard
                    header="Personality Mirroring"
                    description="Engage in the web3 exosystem with our crypto plugins."
                    icon={<CoinIcon />}
                    iconBgColor="bg-blue-500/20"
                />
                <FeatureCard
                    header="Multi-Platform Integration"
                    description="Explore our vibrant community of user created agents and plugins."
                    icon={<BuildingIcon />}
                    iconBgColor="bg-purple-500/20"
                />
                <FeatureCard
                    header="Full Customization"
                    description="Control exactly how your AI behaves, what it posts, when it posts and where it posts."
                    icon={<VerifiedIcon />}
                    iconBgColor="bg-green-500/20"
                />
            </div>
        </div>
    );
}
