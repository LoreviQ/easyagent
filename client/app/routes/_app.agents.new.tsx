import { useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";
import type { UserModelConfig, ModelProvider } from "~/types/database";
import { AgentForm } from "~/components/forms";


export async function loader({ request }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError);
        throw redirect("/login");
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
        modelConfigs: modelConfigs as UserModelConfig[] || [],
        modelProviders: modelProviders as ModelProvider[] || []
    };
}

export default function NewAgent() {

    const { modelConfigs, modelProviders } = useLoaderData<typeof loader>();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Create New Agent</h1>
            <AgentForm
                modelConfigs={modelConfigs}
                modelProviders={modelProviders}
            />
        </div>
    );
} 