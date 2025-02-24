import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Outlet } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";

import type { PrefsCookie } from "~/utils/cookies";
import { prefsCookie, DEFAULT_PREFS } from "~/utils/cookies";
import { Header } from "~/components/header";
import { Sidebar } from "~/components/sidebar";
import { getSupabaseAuth } from "~/utils/supabase";
import { PreferencesProvider, usePreferences } from "~/contexts/preferences";

export async function loader({ request }: { request: Request }) {
    const { supabase } = getSupabaseAuth(request);
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
        throw redirect("/login");
    }
    const userData = (await supabase.auth.getUser()).data.user;
    const cookieHeader = request.headers.get("Cookie");
    const preferences = (await prefsCookie.parse(cookieHeader)) || DEFAULT_PREFS;
    return Response.json({ userData, preferences });
}

export default function App() {
    const loaderData = useLoaderData<typeof loader>();
    const userData = loaderData.userData;
    const preferences = loaderData.preferences as PrefsCookie;

    return (
        <PreferencesProvider initial={preferences}>
            <Layout userData={userData} />
        </PreferencesProvider>
    );
}

interface LayoutProps {
    userData: User;
}
function Layout({ userData }: LayoutProps) {
    const { preferences } = usePreferences();
    const widthClass = preferences.narrowMode ? "max-w-7xl" : "";
    return (
        <div className={`min-h-screen bg-gradient-to-b from-theme-bg to-theme-bg-secondary text-white `}>
            <Header preferences={preferences} email={userData.email} contentWidth={widthClass} />
            <div className={`mx-auto ${widthClass}`}>
                <div className="flex">
                    <Sidebar isOpen={preferences.showSidebar} />
                    <main className="flex-1 p-6">
                        <Outlet context={userData} />
                    </main>
                </div>
            </div>
        </div>
    );
}
