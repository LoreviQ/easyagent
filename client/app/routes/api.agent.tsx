import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseAuth } from "~/utils/supabase";

export type AgentActionData = {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        name?: string;
        system_prompt?: string;
        bio?: string;
        lore?: string;
    };
};

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError);
        throw redirect("/login");
    }

    // Parse form data
    const formData = await request.formData();
    const actionType = formData.get("action") as string;

    try {
        // Handle different actions
        switch (actionType) {
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
        console.error(`Error in agent ${actionType}:`, error);
        return Response.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
    }
}

async function handleInsert(formData: FormData, supabase: any, userId: string) {
    const name = formData.get("name") as string;
    const isPublic = formData.get("is_public") === "true";
    const systemPrompt = formData.get("system_prompt") as string || null;
    const bio = formData.get("bio") as string || null;
    const lore = formData.get("lore") as string || null;
    const userModelConfigId = formData.get("user_model_config_id") as string || null;
    const avatarFile = formData.get("avatar") as File || null;

    // Validate form data
    const fieldErrors: AgentActionData["fieldErrors"] = {};
    if (!name || name.trim() === "") {
        fieldErrors.name = "Name is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return Response.json({ fieldErrors } as AgentActionData, { status: 400 });
    }

    let avatarUrl = null;

    // Handle avatar upload if a file was provided
    if (avatarFile && avatarFile.size > 0) {
        try {
            // Create a unique filename using the user ID and timestamp
            const fileExtension = avatarFile.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExtension}`;
            const filePath = `${userId}/${fileName}`;

            // Upload the file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('agent-avatars') // Make sure this bucket exists in your Supabase project
                .upload(filePath, avatarFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Error uploading avatar:", uploadError);
                return Response.json({
                    error: "Failed to upload avatar image. Please try again."
                } as AgentActionData, { status: 500 });
            }

            // Get the public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('agent-avatars')
                .getPublicUrl(filePath);

            avatarUrl = publicUrl;
        } catch (error) {
            console.error("Error processing avatar upload:", error);
            return Response.json({
                error: "Failed to process avatar image. Please try again."
            } as AgentActionData, { status: 500 });
        }
    }

    // Insert new agent into the database
    const { error: insertError } = await supabase
        .from('agents')
        .insert({
            owner_id: userId,
            name,
            is_public: isPublic,
            system_prompt: systemPrompt,
            bio,
            lore,
            user_model_config_id: userModelConfigId || null,
            avatar_url: avatarUrl
        })
        .select()
        .single();

    if (insertError) {
        console.error("Error creating agent:", insertError);
        return Response.json({
            error: "Failed to create agent. Please try again."
        } as AgentActionData, { status: 500 });
    }

    return redirect("/agents");
}

async function handleUpdate(formData: FormData, supabase: any, userId: string) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const isPublic = formData.get("is_public") === "true";
    const systemPrompt = formData.get("system_prompt") as string || null;
    const bio = formData.get("bio") as string || null;
    const lore = formData.get("lore") as string || null;
    const userModelConfigId = formData.get("user_model_config_id") as string || null;
    const avatarFile = formData.get("avatar") as File || null;

    // Validate inputs
    if (!id || !name) {
        return Response.json({
            fieldErrors: { name: !name ? "Name is required" : undefined }
        } as AgentActionData, { status: 400 });
    }

    // First verify the agent belongs to this user
    const { data: existingAgent, error: fetchError } = await supabase
        .from('agents')
        .select('id, owner_id, avatar_url')
        .eq('id', id)
        .single();

    if (fetchError || !existingAgent) {
        return Response.json({ error: "Agent not found" }, { status: 404 });
    }

    if (existingAgent.owner_id !== userId) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {
        name,
        is_public: isPublic,
        system_prompt: systemPrompt,
        bio,
        lore,
        user_model_config_id: userModelConfigId || null,
        updated_at: new Date().toISOString()
    };

    // Handle avatar upload if a file was provided
    if (avatarFile && avatarFile.size > 0) {
        try {
            // Create a unique filename using the user ID and timestamp
            const fileExtension = avatarFile.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExtension}`;
            const filePath = `${userId}/${fileName}`;

            // Upload the file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('agent-avatars')
                .upload(filePath, avatarFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Error uploading avatar:", uploadError);
                return Response.json({
                    error: "Failed to upload avatar image. Please try again."
                } as AgentActionData, { status: 500 });
            }

            // Get the public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('agent-avatars')
                .getPublicUrl(filePath);

            updateData.avatar_url = publicUrl;

            // Delete the old avatar if it exists
            if (existingAgent.avatar_url) {
                try {
                    // Extract the path from the URL
                    const urlParts = existingAgent.avatar_url.split('agent-avatars/');
                    if (urlParts.length > 1) {
                        const oldPath = urlParts[1];
                        await supabase.storage
                            .from('agent-avatars')
                            .remove([oldPath]);
                    }
                } catch (deleteError) {
                    console.error("Error deleting old avatar:", deleteError);
                    // Continue with the update even if deleting the old avatar fails
                }
            }
        } catch (error) {
            console.error("Error processing avatar upload:", error);
            return Response.json({
                error: "Failed to process avatar image. Please try again."
            } as AgentActionData, { status: 500 });
        }
    }

    // Update the agent
    const { data, error: updateError } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select();

    if (updateError) {
        console.error("Error updating agent:", updateError);
        return Response.json({
            error: "Failed to update agent. Please try again."
        } as AgentActionData, { status: 500 });
    }
    return Response.json({ success: true, data });
}

async function handleDelete(formData: FormData, supabase: any, userId: string) {
    const id = formData.get("id") as string;

    if (!id) {
        return Response.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // First verify the agent belongs to this user
    const { data: existingAgent, error: fetchError } = await supabase
        .from('agents')
        .select('id, owner_id, avatar_url')
        .eq('id', id)
        .single();

    if (fetchError || !existingAgent) {
        return Response.json({ error: "Agent not found" }, { status: 404 });
    }

    if (existingAgent.owner_id !== userId) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the agent's avatar if it exists
    if (existingAgent.avatar_url) {
        try {
            // Extract the path from the URL
            const urlParts = existingAgent.avatar_url.split('agent-avatars/');
            if (urlParts.length > 1) {
                const path = urlParts[1];
                await supabase.storage
                    .from('agent-avatars')
                    .remove([path]);
            }
        } catch (error) {
            console.error("Error deleting avatar:", error);
            // Continue with the deletion even if removing the avatar fails
        }
    }

    // Delete the agent
    const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

    if (deleteError) {
        console.error("Error deleting agent:", deleteError);
        return Response.json({
            error: "Failed to delete agent. Please try again."
        }, { status: 500 });
    }

    // Redirect to agents list after successful deletion
    return redirect("/agents");
} 