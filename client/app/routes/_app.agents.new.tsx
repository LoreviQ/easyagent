import { useState } from "react";
import { Form, useActionData, Link, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";
import { SubmitButton } from "~/components/buttons";
import type { UserModelConfig, ModelProvider } from "~/types/database";
import { ModelConfigurations } from "~/components/lists";

export async function loader({ request }: { request: Request }) {
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


type ActionData = {
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
    const fieldErrors: ActionData["fieldErrors"] = {};
    if (!name || name.trim() === "") {
        fieldErrors.name = "Name is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return Response.json({ fieldErrors } as ActionData, { status: 400 });
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
                } as ActionData, { status: 500 });
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
            } as ActionData, { status: 500 });
        }
    }

    // Insert new agent into the database
    const { data: agent, error: insertError } = await supabase
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
        } as ActionData, { status: 500 });
    }

    return redirect("/agents");
}

export default function NewAgent() {
    const actionData = useActionData<typeof action>();
    const [isPublic, setIsPublic] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const { modelConfigs, modelProviders } = useLoaderData<typeof loader>();
    const [selectedModelConfig, setSelectedModelConfig] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create a local URL for preview
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Create New Agent</h1>

            <Form method="post" className="bg-theme-bg-card/70 rounded-lg p-6 shadow-lg" encType="multipart/form-data">
                {actionData?.error && (
                    <div className="p-4 mb-6 bg-theme-error/20 text-theme-error rounded-md">
                        {actionData.error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Avatar upload section */}
                    <div className="w-full md:w-1/3">
                        <div
                            className="aspect-square bg-theme-surface border-2 border-dashed border-theme-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-theme-surface-secondary transition-colors"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Agent avatar"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-theme-border mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm text-theme-text-secondary">Click to upload avatar</p>
                                </>
                            )}
                            <input
                                type="file"
                                id="avatar-upload"
                                name="avatar"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    {/* Name and public toggle */}
                    <div className="w-full md:w-2/3">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                Name <span className="text-theme-error">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                                required
                            />
                            {actionData?.fieldErrors?.name && (
                                <p className="mt-1 text-sm text-theme-error">{actionData.fieldErrors.name}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_public"
                                name="is_public"
                                value="true"
                                checked={isPublic}
                                onChange={() => setIsPublic(!isPublic)}
                                className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded"
                            />
                            <label htmlFor="is_public" className="ml-2 block text-sm">
                                Make this agent public
                            </label>
                        </div>
                    </div>
                </div>

                {/* System Prompt, Bio, and Lore */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="system_prompt" className="block text-sm font-medium mb-1">
                            System Prompt
                        </label>
                        <textarea
                            id="system_prompt"
                            name="system_prompt"
                            rows={4}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="Instructions for how the agent should behave"
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium mb-1">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={2}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="A short description of the agent"
                        />
                    </div>

                    <div>
                        <label htmlFor="lore" className="block text-sm font-medium mb-1">
                            Lore
                        </label>
                        <textarea
                            id="lore"
                            name="lore"
                            rows={4}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="Background information and context for the agent"
                        />
                    </div>
                </div>

                {/* Model Configurations */}
                <div className="mb-6">
                    <ModelConfigurations
                        modelConfigs={modelConfigs}
                        modelProviders={modelProviders}
                        selectedModelConfig={selectedModelConfig}
                        setSelectedModelConfig={setSelectedModelConfig}
                    />

                    {/* Hidden input to store the selected model config ID */}
                    <input
                        type="hidden"
                        name="user_model_config_id"
                        value={selectedModelConfig || ''}
                    />
                </div>

                {/* Form actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-theme-border">
                    <Link
                        to=".."
                        className="px-4 py-2 border border-theme-border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
                    >
                        Cancel
                    </Link>
                    <SubmitButton label="Create Agent" />
                </div>
            </Form>
        </div>
    );
} 