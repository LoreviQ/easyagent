import { Link } from "@remix-run/react";

export function Hero({ }) {
    return (
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center space-y-10">
            <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-primary to-theme-accent pb-2">
                EasyAgent
            </h1>
            <p className="text-xl text-theme-text-secondary mb-12">
                Seamlessly create AI Agents.
            </p>
            <div className="flex gap-6 justify-center">
                <Link
                    to="/login"
                    className="px-8 py-3 bg-theme-primary hover:bg-theme-primary-hover rounded-lg font-semibold transition-colors"
                >
                    Get Started
                </Link>
                <Link
                    to="/partners"
                    className="px-8 py-3 border border-theme-bg-border hover:border-theme-primary rounded-lg font-semibold transition-colors"
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
export function FeatureCard({ header, description, icon, iconBgColor = "bg-theme-primary/20" }: FeatureCardProps) {
    return (
        <div className="p-6 rounded-xl bg-theme-bg-card border border-theme-bg-border">
            <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-4`}>{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-theme-text">{header}</h3>
            <p className="text-theme-text-secondary">{description}</p>
        </div>
    );
}

export function HeadingBreak({ label, colour = undefined }: { label: string; colour?: string }) {
    switch (colour) {
        case "red":
            return (
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] flex-1 bg-theme-warning/30"></div>
                    <h2 className="text-lg font-semibold text-theme-warning whitespace-nowrap">{label}</h2>
                    <div className="h-[1px] flex-1 bg-theme-warning/30"></div>
                </div>
            );
    }
    return (
        <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-theme-success/30"></div>
            <h2 className="text-lg font-semibold text-theme-success whitespace-nowrap">{label}</h2>
            <div className="h-[1px] flex-1 bg-theme-success/30"></div>
        </div>
    );
}

interface ContentCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function ContentCard({ title, children, className = "" }: ContentCardProps) {
    return (
        <div className={`bg-theme-bg-card/70 rounded-lg p-6 ${className}`}>
            <h1 className="text-xl font-semibold mb-4">{title}</h1>
            {children}
        </div>
    );
}