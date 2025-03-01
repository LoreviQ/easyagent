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
    const action = formData.get("action") as string;

    try {
        // Handle different actions
        switch (action) {
            case "insert":
                return handleInsert(formData, supabase, user.id);
            case "update":
                return handleUpdate(formData, supabase, user.id);
            case "delete":
                return handleDelete(formData, supabase, user.id);
            default:
                return Response.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error(`Error in model configuration ${action}:`, error);
        return Response.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
    }
}

async function handleInsert(formData: FormData, supabase: any, userId: string) {
    // Parse form data
    const name = formData.get("name") as string;
    const model_provider_id = formData.get("model_provider_id") as string;
    const api_key = formData.get("api_key") as string;

    // Validate inputs
    if (!name || !model_provider_id || !api_key) {
        return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    // Insert the new model configuration
    const { data, error } = await supabase
        .from('user_model_configs')
        .insert([
            {
                name,
                model_provider_id,
                api_key,
                owner_id: userId,
            }
        ])
        .select();

    if (error) {
        console.error("Error creating model configuration:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }

    // Return success response
    return Response.json({ success: true, data });
}

async function handleUpdate(formData: FormData, supabase: any, userId: string) {
    // Parse form data
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const model_provider_id = formData.get("model_provider_id") as string;
    const api_key = formData.get("api_key") as string;
    const api_key_changed = formData.get("api_key_changed") === "1";

    // Validate inputs
    if (!id || !name || !model_provider_id) {
        return Response.json({ error: "Required fields missing" }, { status: 400 });
    }

    // First verify the config belongs to this user
    const { data: existingConfig, error: fetchError } = await supabase
        .from('user_model_configs')
        .select('id, owner_id')
        .eq('id', id)
        .single();

    if (fetchError || !existingConfig) {
        return Response.json({ error: "Configuration not found" }, { status: 404 });
    }

    if (existingConfig.owner_id !== userId) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {
        name,
        model_provider_id,
        updated_at: new Date().toISOString()
    };

    // Only update API key if it was changed
    if (api_key_changed && api_key) {
        updateData.api_key = api_key;
    }

    // Update the configuration
    const { data, error } = await supabase
        .from('user_model_configs')
        .update(updateData)
        .eq('id', id)
        .select();

    if (error) {
        console.error("Error updating model configuration:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }

    // Return success response
    return Response.json({ success: true, data });
}

async function handleDelete(formData: FormData, supabase: any, userId: string) {
    // Parse form data
    const id = formData.get("id") as string;

    if (!id) {
        return Response.json({ error: "Configuration ID is required" }, { status: 400 });
    }

    // First verify the config belongs to this user
    const { data: existingConfig, error: fetchError } = await supabase
        .from('user_model_configs')
        .select('id, owner_id')
        .eq('id', id)
        .single();

    if (fetchError || !existingConfig) {
        return Response.json({ error: "Configuration not found" }, { status: 404 });
    }

    if (existingConfig.owner_id !== userId) {
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
} 