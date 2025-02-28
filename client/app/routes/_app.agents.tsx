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

    return {
        agents: agents as Agent[] || [],
        modelConfigs: modelConfigs as UserModelConfig[] || [],
        modelProviders: modelProviders as ModelProvider[] || []
    };
}

export default function Agents() {
    const data = useLoaderData<typeof loader>();

    return <Outlet context={data} />;
}