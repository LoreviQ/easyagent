import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";

import { Logo, Bars3Icon, ChevronLeftIcon, ChevronRightIcon, UserIcon } from "~/components/icons";
import { PrefsCookie } from "~/utils/cookies";
import { usePreferences } from "~/contexts/preferences";

interface HeaderProps {
    preferences: PrefsCookie;
    email?: string;
    contentWidth: string;
}
export function Header({ email, contentWidth }: HeaderProps) {
    const [cols, setCols] = useState(10);
    const [buttonsCols, setButtonsCols] = useState(2);
    const [searchCols, setSearchCols] = useState(6);
    const [userCols, setUserCols] = useState(2);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) { // mobile
                setCols(3);
                setButtonsCols(2);
                setSearchCols(0);
                setUserCols(1);
            } else if (width < 768) { // tablet
                setCols(8);
                setButtonsCols(1);
                setSearchCols(6);
                setUserCols(1);
            } else if (width < 1024) { // small desktop
                setCols(8);
                setButtonsCols(1);
                setSearchCols(6);
                setUserCols(1);
            } else { // large desktop
                setCols(12);
                setButtonsCols(3);
                setSearchCols(6);
                setUserCols(3);
            }
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="bg-theme-bg border-b border-theme-bg-border sticky top-0 z-50">
            <div className={`grid items-center h-16 px-8 mx-auto ${contentWidth}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                <HeaderButtons cols={buttonsCols} />
                <SearchBar cols={searchCols} />
                <UserInfo email={email} cols={userCols} />
            </div>
        </header >
    );
}

function HeaderButtons({ cols }: { cols: number }) {
    const { preferences, updatePreference } = usePreferences();
    return (
        <div className={`flex items-center space-x-4 justify-start`} style={{ gridColumn: `span ${cols}` }}>
            <button
                onClick={() => updatePreference("narrowMode", !preferences.narrowMode)}
                className="p-2 rounded-lg text-white hover:bg-theme-bg-card"
            >
                {preferences.narrowMode ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
            </button>
            <button
                onClick={() => updatePreference("showSidebar", !preferences.showSidebar)}
                className="p-2 rounded-lg text-white hover:bg-theme-bg-card"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
            {cols > 1 && <Link to="/" className="flex items-center">
                <Logo />
            </Link>}
        </div>
    );
}
function SearchBar({ cols }: { cols: number }) {
    if (cols < 1) return null;
    return (
        <div className="flex justify-center" style={{ gridColumn: `span ${cols}` }}>
            <div className="flex w-full max-w-xl relative">
                <input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-theme-bg-card border border-gray-700 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-theme-secondary"
                />
                <button className="absolute right-3 top-2.5 text-white hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="curr
entColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function UserInfo({ email = "none", cols }: { email?: string, cols: number }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="flex justify-end relative" style={{ gridColumn: `span ${cols}` }}>
            <div className="flex items-center gap-3">
                {cols > 1 && <span className="text-white">{email}</span>}
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                    <UserIcon className="text-white w-6 h-6" />
                </button>
            </div>
            {isOpen && <Dropdown />}
        </div>
    );
}

function Dropdown() {
    return (
        <div className="absolute right-0 top-full mt-3 w-48 rounded-lg bg-theme-bg-card border border-theme-bg-border shadow-lg py-1">
            <Form method="post" action="/logout">
                <button className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors">
                    Logout
                </button>
            </Form>
        </div>
    );
}