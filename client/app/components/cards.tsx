import { Link } from "@remix-run/react";

export function Hero({ }) {
    return (
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center space-y-10">
            <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 pb-2">
                EasyAgent
            </h1>
            <p className="text-xl text-gray-300 mb-12">
                Seamlessly create AI Agents.
            </p>
            <div className="flex gap-6 justify-center">
                <Link
                    to="/login"
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
                >
                    Get Started
                </Link>
                <Link
                    to="/partners"
                    className="px-8 py-3 border border-gray-500 hover:border-blue-400 rounded-lg font-semibold transition-colors"
                >
                    Learn More
                </Link>
            </div>
        </div>
    );
}

interface FeatureCardProps {
    header: string;
    description: string;
    icon: React.ReactNode;
    iconBgColor?: string;
}
export function FeatureCard({ header, description, icon, iconBgColor = "bg-blue-500/20" }: FeatureCardProps) {
    return (
        <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
            <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-4`}>{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{header}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}
