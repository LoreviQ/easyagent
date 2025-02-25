import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseAuth } from "~/utils/supabase";

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
        return Response.json({ error: "Configuration ID is required" }, { status: 400 });
    }

    try {
        // First verify the config belongs to this user
        const { data: existingConfig, error: fetchError } = await supabase
            .from('user_model_configs')
            .select('id, owner_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingConfig) {
            return Response.json({ error: "Configuration not found" }, { status: 404 });
        }

        if (existingConfig.owner_id !== user.id) {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete the configuration
        const { error } = await supabase
            .from('user_model_configs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting model configuration:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        // Return success response
        return Response.json({ success: true });

    } catch (error: any) {
        console.error("Error deleting model configuration:", error);
        return Response.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
    }
} 