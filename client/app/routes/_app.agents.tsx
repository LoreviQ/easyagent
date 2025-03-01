import { Outlet, useLoaderData, useOutletContext, type ShouldRevalidateFunction } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import type { User } from "@supabase/supabase-js";

import type { UserModelConfig, ModelProvider } from "~/types/database";
import type { Agent } from "~/types/database";
import { getSupabaseAuth } from "~/utils/supabase";

export async function loader({ request }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError);
        throw redirect("/login");
    }

    // Fetch user's agents
    const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

    if (agentsError) {
        console.error("Error fetching agents:", agentsError);
    }

    return {
        agents: agents || [],
    };
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
    formMethod,
    currentUrl,
    nextUrl,
    defaultShouldRevalidate
}) => {
    console.log("agents shouldRevalidate called", {
        currentUrl: currentUrl.pathname,
        nextUrl: nextUrl.pathname
    });

    // Don't revalidate when navigating between agent child routes
    // For example, from /agents/123 to /agents/new
    if (currentUrl.pathname.startsWith('/agents/') &&
        nextUrl.pathname.startsWith('/agents/')) {
        return false;
    }

    // Also don't revalidate when navigating from /agents to any /agents/* route
    if ((currentUrl.pathname === '/agents' && nextUrl.pathname.startsWith('/agents/')) ||
        (nextUrl.pathname === '/agents' && currentUrl.pathname.startsWith('/agents/'))) {
        return false;
    }

    return defaultShouldRevalidate;
};

export default function Agents() {
    const { agents } = useLoaderData<{ agents: Agent[] }>();
    const parentContext = useOutletContext<{
        userData: User;
        modelConfigs: UserModelConfig[];
        modelProviders: ModelProvider[];
    }>();

    return <Outlet context={{ ...parentContext, agents }} />;
}