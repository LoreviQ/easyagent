import { useState, useEffect } from "react";
import { useLocation } from "@remix-run/react";

import { BlockIcon, BuildingIcon, CogIcon } from "./icons";
import { NavButton } from "./buttons";
import { usePreferences } from "~/contexts/preferences";

export function Sidebar() {
    const [mobile, setMobile] = useState(false);
    const { preferences } = usePreferences();

    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 640);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (mobile) {
        return (
            <aside
                className={`
                    ${preferences.showSidebar ? "translate-x-0" : "-translate-x-full"}
                    fixed w-full h-full
                    bg-theme-bg z-50
                    border-r border-theme-bg-border 
                    transition-all duration-300 ease-in-out
                `}
            >
                {sidebarContent(preferences.showSidebar ?? true)}
            </aside>
        );
    }
    return (
        <aside
            className={`
                ${preferences.showSidebar ? "w-64" : "w-20"}
                h-[calc(100vh-65px)]
                border-r border-theme-bg-border 
                transition-all duration-300 ease-in-out
            `}
        >
            {sidebarContent(preferences.showSidebar ?? true)}
        </aside>
    );
}

function sidebarContent(isOpen: boolean) {
    const location = useLocation();
    const navLinks = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <BlockIcon className="w-6 h-6" />,
        },
        {
            name: "Agent",
            path: "/agent",
            icon: <BuildingIcon className="w-6 h-6" />,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: <CogIcon className="w-6 h-6" />,
        },
    ];
    return (
        <div className="px-4 py-6">
            <nav className="space-y-2">
                {navLinks.map((link) => {
                    return (
                        <NavButton
                            key={link.path}
                            path={link.path}
                            label={link.name}
                            icon={link.icon}
                            isActive={location.pathname === link.path}
                            isOpen={isOpen}
                        />
                    );
                })}
            </nav>
            <div className="my-6 border-t border-theme-bg-border" />
        </div>
    );
}