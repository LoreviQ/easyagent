import { Link } from "@remix-run/react";

interface NavButtonProps {
    path: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    isOpen?: boolean;
}
export function NavButton({ path, label, icon, isActive, isOpen }: NavButtonProps) {
    return (
        <Link
            to={path}
            className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-300 ease-in-out min-w-12 min-h-12 ${isActive
                    ? "bg-theme-primary/10 text-theme-secondary-hover"
                    : "text-theme-secondary hover:bg-theme-primary-hover/10 hover:text-theme-secondary-hover"
                }`}
        >
            <div className="flex-shrink-0">{icon}</div>
            {isOpen && <span className="font-medium transition-opacity duration-300">{label}</span>}
        </Link>
    );
}

export function SubmitButton({ label, className }: { label: string; className?: string }) {
    return (
        <button className={`px-4 py-2 min-w-32 text-white rounded-3xl ${className}`} type="submit">
            {label}
        </button>
    );
}
