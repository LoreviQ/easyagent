import { useState } from "react";
import { Form, useActionData, Link, useOutletContext } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";
import { HeadingBreak } from "~/components/cards";
import { SubmitButton } from "~/components/buttons";
import type { Agent } from "~/types/database";

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
    const system_prompt = formData.get("system_prompt") as string;
    const bio = formData.get("bio") as string;
    const lore = formData.get("lore") as string;
    const is_public = formData.get("is_public") === "true";
    const user_model_config_id = formData.get("user_model_config_id") as string || null;

    // Validate form data
    const fieldErrors: ActionData["fieldErrors"] = {};
    if (!name || name.trim() === "") {
        fieldErrors.name = "Name is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return Response.json({ fieldErrors } as ActionData, { status: 400 });
    }

    // Insert new agent
    const { data, error } = await supabase
        .from("agents")
        .insert([
            {
                owner_id: user.id,
                name,
                system_prompt: system_prompt || null,
                bio: bio || null,
                lore: lore || null,
                is_public,
                user_model_config_id: user_model_config_id || null,
            },
        ])
        .select();

    if (error) {
        console.error("Error creating agent:", error);
        return Response.json({ error: error.message } as ActionData, { status: 500 });
    }

    // Redirect to the agents page
    return redirect("/agents");
}

// Type for the model configurations
type ModelConfig = {
    id: string;
    name: string;
    model_provider_id: string;
    // Add other fields as needed
};

type ModelProvider = {
    id: string;
    name: string;
};

type AgentsContext = {
    agents: Agent[];
    modelConfigs?: ModelConfig[];
    modelProviders?: ModelProvider[];
};

export default function NewAgent() {
    const actionData = useActionData<typeof action>();
    const [isPublic, setIsPublic] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [selectedModelConfig, setSelectedModelConfig] = useState<string | null>(null);

    // We'll need to fetch model configs from the parent route
    const { modelConfigs = [], modelProviders = [] } = useOutletContext<AgentsContext>();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // For now, just create a local URL for preview
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
            // In a real implementation, you'd upload this to storage
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Create New Agent</h1>

            <Form method="post" className="bg-theme-bg-card/70 rounded-lg p-6 shadow-lg">
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
                    <HeadingBreak label="Model Configuration" />

                    {modelConfigs.length > 0 ? (
                        <div className="space-y-2 mt-4">
                            {modelConfigs.map((config) => (
                                <div key={config.id} className="flex items-center justify-between py-3 px-4 bg-theme-surface-secondary rounded-lg">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`config-${config.id}`}
                                            name="user_model_config_id"
                                            value={config.id}
                                            checked={selectedModelConfig === config.id}
                                            onChange={() => setSelectedModelConfig(config.id)}
                                            className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border"
                                        />
                                        <div className="ml-3">
                                            <h3 className="font-medium text-lg">{config.name || 'Unnamed Configuration'}</h3>
                                            <p className="text-sm text-gray-300">
                                                {modelProviders.find(p => p.id === config.model_provider_id)?.name || 'No model specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-gray-400">No model configurations found</p>
                            <Link
                                to="/settings"
                                className="inline-block mt-2 text-theme-primary hover:underline"
                            >
                                Create a model configuration
                            </Link>
                        </div>
                    )}
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