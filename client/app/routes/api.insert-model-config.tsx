import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseAuth } from "~/utils/supabase";

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);

    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const model_provider_id = formData.get("model_provider_id") as string;
    const api_key = formData.get("api_key") as string;

    // Validate inputs
    if (!name || !model_provider_id || !api_key) {
        return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    try {
        // Insert the new model configuration
        const { data, error } = await supabase
            .from('user_model_configs')
            .insert([
                {
                    name,
                    model_provider_id,
                    api_key,
                    owner_id: session.user.id,
                }
            ])
            .select();

        if (error) {
            console.error("Error creating model configuration:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        // Return success response
        return Response.json({ success: true, data });

    } catch (error: any) {
        console.error("Error creating model configuration:", error);
        return Response.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
    }
} 