import { Outlet, useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";
import type { Agent, UserModelConfig, ModelProvider } from "~/types/database";

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
    const data = useLoaderData<typeof loader>();

    return <Outlet context={data} />;
}