import { useFetcher, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { UserModelConfig, ModelProvider } from "~/types/database";
import { Form, Link } from "@remix-run/react";
import { SubmitButton } from "~/components/buttons";
import { ModelConfigurations } from "~/components/lists";
import { InsertAgentActionData } from "~/routes/api.insert-agent";

// Define the response type for the form submission
export interface FormActionResponse {
    success?: boolean;
    error?: string;
    data?: any;
}

interface ModelConfigFormProps {
    initialValues?: UserModelConfig | null;
    modelProviders: ModelProvider[];
    onCancel: () => void;
    onSuccess?: () => void;
}

export function ModelConfigForm({
    initialValues,
    modelProviders,
    onCancel,
    onSuccess
}: ModelConfigFormProps) {
    const formFetcher = useFetcher<FormActionResponse>();
    const isSubmitting = formFetcher.state === "submitting";
    const isEdit = !!initialValues?.id;

    // Determine the action route based on whether we're editing or creating
    const actionRoute = isEdit
        ? "/api/update-model-config"
        : "/api/create-model-config";

    const [apiKeyChanged, setApiKeyChanged] = useState(false);

    // Handle form submission response
    useEffect(() => {
        if (formFetcher.data && formFetcher.state === "idle") {
            if (formFetcher.data.success && onSuccess) {
                onSuccess();
            } else if (formFetcher.data.error) {
                alert(`Error: ${formFetcher.data.error}`);
            }
        }
    }, [formFetcher.data, formFetcher.state, onSuccess]);

    return (
        <div className="bg-theme-surface-secondary rounded-lg">
            <h3 className="font-medium text-lg mb-4">
                {isEdit ? "Edit Configuration" : "Create New Configuration"}
            </h3>
            <formFetcher.Form method="post" action={actionRoute}>
                {/* Hidden ID field for edits */}
                {isEdit && <input type="hidden" name="id" value={initialValues.id} />}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="config_name" className="block text-sm font-medium mb-1">
                            Configuration Name
                        </label>
                        <input
                            type="text"
                            id="config_name"
                            name="name"
                            required
                            defaultValue={initialValues?.name || ""}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="My Configuration"
                        />
                    </div>

                    <div>
                        <label htmlFor="config_model_provider_id" className="block text-sm font-medium mb-1">
                            Model Provider
                        </label>
                        <select
                            id="config_model_provider_id"
                            name="model_provider_id"
                            required
                            defaultValue={initialValues?.model_provider_id || ""}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        >
                            {modelProviders.map(provider => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="config_api_key" className="block text-sm font-medium mb-1">
                            API Key {isEdit && !apiKeyChanged && <span className="text-xs text-gray-400">(enter new key to change)</span>}
                        </label>
                        <input
                            type="password"
                            id="config_api_key"
                            name="api_key"
                            required={!isEdit}
                            onChange={() => setApiKeyChanged(true)}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder={isEdit ? "••••••••••••••••" : "sk-..."}
                        />
                        {isEdit && (
                            <input
                                type="hidden"
                                name="api_key_changed"
                                value={apiKeyChanged ? "1" : "0"}
                            />
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-theme-surface-secondary hover:bg-theme-surface-tertiary rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover rounded flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save Configuration"
                            )}
                        </button>
                    </div>
                </div>
            </formFetcher.Form>
        </div>
    );
}


interface AgentFormProps {
    modelConfigs: UserModelConfig[];
    modelProviders: ModelProvider[];
}

export function AgentForm({ modelConfigs, modelProviders }: AgentFormProps) {
    const actionData = useActionData<InsertAgentActionData>();
    const [isPublic, setIsPublic] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
        <Form method="post" action="/api/insert-agent" className="bg-theme-bg-card/70 rounded-lg p-6 shadow-lg" encType="multipart/form-data">
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
    );
} 