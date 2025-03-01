import { Link } from "@remix-run/react";
import { usePreferences } from "~/contexts/preferences";

interface SidebarButtonProps {
    path: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    isOpen?: boolean;
}
export function SidebarButton({ path, label, icon, isActive, isOpen }: SidebarButtonProps) {
    const { updatePreference } = usePreferences();
    return (
        <Link
            to={path}
            className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-300 ease-in-out min-w-12 min-h-12 ${isActive
                ? "bg-theme-primary/10 text-theme-secondary-hover"
                : "text-theme-secondary hover:bg-theme-primary-hover/10 hover:text-theme-secondary-hover"
                }`}
            onClick={() => {
                window.innerWidth < 640 ? updatePreference("showSidebar", !isOpen) : null;
            }}
        >
            <div className="flex-shrink-0">{icon}</div>
            {isOpen && <span className="font-medium transition-opacity duration-300">{label}</span>}
        </Link>
    );
}

export function SubmitButton({ label, className, disabled }: { label: string; className?: string; disabled?: boolean }) {
    return (
        <button className={`px-4 py-2 min-w-32 text-white rounded-3xl ${className}`} type="submit" disabled={disabled}>
            {label}
        </button>
    );
}

export function NavButton({ label, className, path }: { label: string; className?: string; path: string }) {
    return (
        <Link to={path} className={`px-4 py-2 text-white rounded-3xl ${className}`}>
            {label}
        </Link>
    );
}

export function ActionButton({ label, className, onClick }: { label: string; className?: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-white rounded ${className}`}
        >
            {label}
        </button>
    );
}