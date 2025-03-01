import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
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

export default function Agents() {
    const { agents } = useLoaderData<{ agents: Agent[] }>();
    const parentContext = useOutletContext<{
        userData: User;
        modelConfigs: UserModelConfig[];
        modelProviders: ModelProvider[];
    }>();

    return <Outlet context={{ ...parentContext, agents }} />;
}