import { redirect } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Outlet, type ShouldRevalidateFunction } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";

import type { PrefsCookie } from "~/utils/cookies";
import { prefsCookie, DEFAULT_PREFS } from "~/utils/cookies";
import { getSupabaseAuth } from "~/utils/supabase";
import { Header } from "~/components/header";
import { Sidebar } from "~/components/sidebar";
import { AnimatedLoadingIcon } from "~/components/icons";
import { PreferencesProvider, usePreferences } from "~/contexts/preferences";
import type { UserModelConfig, ModelProvider } from "~/types/database";

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
    const { data: modelConfigs, error: configsError } = await supabase
        .from('user_model_configs')
        .select('*')
        .eq('owner_id', user.id);

    if (configsError) {
        console.error("Error fetching model configurations:", configsError);
    }

    // Fetch model providers
    const { data: modelProviders, error: providersError } = await supabase
        .from('model_providers')
        .select('id, name');

    if (providersError) {
        console.error("Error fetching model providers:", providersError);
    }

    return { user, preferences, modelConfigs, modelProviders }
}



export default function App() {
    const loaderData = useLoaderData<typeof loader>();
    const userData = loaderData.user;
    const preferences = loaderData.preferences as PrefsCookie;
    const modelConfigs = loaderData.modelConfigs as UserModelConfig[];
    const modelProviders = loaderData.modelProviders as ModelProvider[];

    return (
        <PreferencesProvider initial={preferences}>
            <Layout userData={userData} modelConfigs={modelConfigs} modelProviders={modelProviders} />
        </PreferencesProvider>
    );
}
/*
export const shouldRevalidate: ShouldRevalidateFunction = ({
    formMethod,
    currentUrl,
    nextUrl,
    defaultShouldRevalidate
}) => {
    // Only apply this logic to routes under _app (which appear as /agents, /settings, etc.)
    // Check if we're navigating between two routes that are both under _app
    const appRoutePatterns = ['/agents', '/settings', '/dashboard'];

    const isCurrentAppRoute = appRoutePatterns.some(pattern =>
        currentUrl.pathname === pattern || currentUrl.pathname.startsWith(`${pattern}/`));

    const isNextAppRoute = appRoutePatterns.some(pattern =>
        nextUrl.pathname === pattern || nextUrl.pathname.startsWith(`${pattern}/`));

    if (isCurrentAppRoute && isNextAppRoute) {
        // Don't revalidate when navigating between _app child routes
        return false;
    }

    return defaultShouldRevalidate;
}
*/
interface LayoutProps {
    userData: User;
    modelConfigs: UserModelConfig[];
    modelProviders: ModelProvider[];
}
function Layout({ userData, modelConfigs, modelProviders }: LayoutProps) {
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
                        {navigation.state === "loading" ? <AnimatedLoadingIcon location={navigation.location?.pathname} /> : <Outlet context={{ userData, modelConfigs, modelProviders }} />}
                    </main>
                </div>
            </div>
        </div>
    );
}

