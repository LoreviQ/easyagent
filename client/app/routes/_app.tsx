import { redirect } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Outlet } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";

import type { PrefsCookie } from "~/utils/cookies";
import { prefsCookie, DEFAULT_PREFS } from "~/utils/cookies";
import { getSupabaseAuth } from "~/utils/supabase";
import { Header } from "~/components/header";
import { Sidebar } from "~/components/sidebar";
import { AnimatedLoadingIcon } from "~/components/icons";
import { PreferencesProvider, usePreferences } from "~/contexts/preferences";

export async function loader({ request }: { request: Request }) {
    const { supabase } = getSupabaseAuth(request);
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
        throw redirect("/login");
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        console.error("Error fetching user:", userError);
        throw redirect("/login");
    }
    const cookieHeader = request.headers.get("Cookie");
    const preferences = (await prefsCookie.parse(cookieHeader)) || DEFAULT_PREFS;

    // Fetch user model configurations
    return Response.json({ user, preferences });
}

export default function App() {
    const loaderData = useLoaderData<typeof loader>();
    const userData = loaderData.user;
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
    const navigation = useNavigation();

    const widthClass = preferences.narrowMode ? "max-w-7xl" : "";
    return (
        <div className={`min-h-screen bg-gradient-to-b from-theme-bg to-theme-bg-secondary text-white `}>
            <Header email={userData.email} contentWidth={widthClass} />
            <div className={`mx-auto ${widthClass}`}>
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-6">
                        {navigation.state === "loading" ? <AnimatedLoadingIcon location={navigation.location?.pathname} /> : <Outlet context={userData} />}
                    </main>
                </div>
            </div>
        </div>
    );
}
