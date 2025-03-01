import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseAuth } from "~/utils/supabase";

export type InsertAgentActionData = {
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
    const name = formData.get("name") as string;
    const isPublic = formData.get("is_public") === "true";
    const systemPrompt = formData.get("system_prompt") as string || null;
    const bio = formData.get("bio") as string || null;
    const lore = formData.get("lore") as string || null;
    const userModelConfigId = formData.get("user_model_config_id") as string || null;
    const avatarFile = formData.get("avatar") as File || null;

    // Validate form data
    const fieldErrors: InsertAgentActionData["fieldErrors"] = {};
    if (!name || name.trim() === "") {
        fieldErrors.name = "Name is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return Response.json({ fieldErrors } as InsertAgentActionData, { status: 400 });
    }

    let avatarUrl = null;

    // Handle avatar upload if a file was provided
    if (avatarFile && avatarFile.size > 0) {
        try {
            // Create a unique filename using the user ID and timestamp
            const fileExtension = avatarFile.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
            const filePath = `${user.id}/${fileName}`;

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
                } as InsertAgentActionData, { status: 500 });
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
            } as InsertAgentActionData, { status: 500 });
        }
    }

    // Insert new agent into the database
    const { error: insertError } = await supabase
        .from('agents')
        .insert({
            owner_id: user.id,
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
        } as InsertAgentActionData, { status: 500 });
    }

    return redirect("/agents");
} 