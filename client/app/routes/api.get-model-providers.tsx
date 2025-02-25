import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseAuth } from "~/utils/supabase";

export async function loader({ request }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);

    // Fetch model providers
    const { data: modelProviders, error: providersError } = await supabase
        .from('model_providers')
        .select('id, name');

    if (providersError) {
        console.error("Error fetching model providers:", providersError);
        return Response.json({ error: providersError.message }, { status: 500 });
    }

    return Response.json({ modelProviders: modelProviders || [] });
} 