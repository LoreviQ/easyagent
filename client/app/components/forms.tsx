import { useFetcher, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { UserModelConfig, ModelProvider } from "~/types/database";
import { Form, Link } from "@remix-run/react";
import { NavButton, SubmitButton } from "~/components/buttons";
import { ModelConfigurations } from "~/components/lists";
import { AgentActionData } from "~/routes/api.agent";

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
            <formFetcher.Form method="post" action={"/api/model-config"}>
                {/* Add action field for the combined endpoint */}
                <input
                    type="hidden"
                    name="action"
                    value={isEdit ? "update" : "insert"}
                />

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
    initialValues?: any;
    modelConfigs: UserModelConfig[];
    modelProviders: ModelProvider[];
    readOnly?: boolean;
}

export function AgentForm({ initialValues, modelConfigs, modelProviders, readOnly = false }: AgentFormProps) {
    const actionData = useActionData<AgentActionData>();
    const [isPublic, setIsPublic] = useState(initialValues?.is_public || false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialValues?.avatar_url || null);
    const [selectedModelConfig, setSelectedModelConfig] = useState<string | null>(
        initialValues?.user_model_config_id || null
    );

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create a local URL for preview
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
        }
    };

    return (
        <Form method="post" action="/api/agent" className="bg-theme-bg-card/70 rounded-lg p-6 shadow-lg" encType="multipart/form-data">
            {actionData?.error && (
                <div className="p-4 mb-6 bg-theme-error/20 text-theme-error rounded-md">
                    {actionData.error}
                </div>
            )}

            {/* Hidden action field for the combined endpoint */}
            <input type="hidden" name="action" value={initialValues?.id ? "update" : "insert"} />
            {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

            <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Avatar upload section */}
                <div className="w-full md:w-1/3">
                    <div
                        className={`aspect-square bg-theme-surface border-2 ${!readOnly ? 'border-dashed cursor-pointer hover:bg-theme-surface-secondary' : ''} border-theme-border rounded-lg flex flex-col items-center justify-center transition-colors`}
                        onClick={() => !readOnly && document.getElementById('avatar-upload')?.click()}
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
                                <p className="text-sm text-theme-text-secondary">
                                    {readOnly ? "No avatar" : "Click to upload avatar"}
                                </p>
                            </>
                        )}
                        {!readOnly && (
                            <input
                                type="file"
                                id="avatar-upload"
                                name="avatar"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        )}
                    </div>
                </div>

                {/* Name and public toggle */}
                <div className="w-full md:w-2/3">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Name {!readOnly && <span className="text-theme-error">*</span>}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            required={!readOnly}
                            defaultValue={initialValues?.name || ""}
                            readOnly={readOnly}
                            disabled={readOnly}
                        />
                        {actionData?.fieldErrors?.name && (
                            <p className="mt-1 text-sm text-theme-error">{actionData.fieldErrors.name}</p>
                        )}
                    </div>

                    <div className="flex items-center">
                        <label htmlFor="is_public" className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="is_public"
                                name="is_public"
                                value="true"
                                checked={isPublic}
                                onChange={() => !readOnly && setIsPublic(!isPublic)}
                                disabled={readOnly}
                                className="sr-only"
                            />
                            <div className={`relative w-11 h-6 bg-gray-600 rounded-full transition-colors ${isPublic ? 'bg-theme-primary' : ''} ${readOnly ? 'opacity-60' : ''}`}>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-5' : ''}`}></div>
                            </div>
                            <span className="ml-2 text-md">
                                {isPublic ? "Public" : "Private"}
                            </span>
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
                        placeholder={readOnly ? "No system prompt" : "Instructions for how the agent should behave"}
                        defaultValue={initialValues?.system_prompt || ""}
                        readOnly={readOnly}
                        disabled={readOnly}
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
                        placeholder={readOnly ? "No bio" : "A short description of the agent"}
                        defaultValue={initialValues?.bio || ""}
                        readOnly={readOnly}
                        disabled={readOnly}
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
                        placeholder={readOnly ? "No lore" : "Background information and context for the agent"}
                        defaultValue={initialValues?.lore || ""}
                        readOnly={readOnly}
                        disabled={readOnly}
                    />
                </div>
            </div>

            {/* Model Configurations */}
            <div className="mb-6">
                {readOnly && initialValues?.user_model_config_id ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {(() => {
                                const config = modelConfigs.find(c => c.id === initialValues.user_model_config_id);
                                if (!config) return <p className="text-gray-400">No model configuration selected</p>;

                                return (
                                    <div className="flex items-center justify-between py-3 px-4 bg-theme-surface-secondary rounded-lg">
                                        <div className="flex items-center justify-between w-full">
                                            <h1 className="text-lg font-medium">
                                                Model Configuration:
                                            </h1>
                                            <div>
                                                <h3 className="font-medium text-lg">{config.name || 'Unnamed Configuration'}</h3>
                                                <p className="text-sm text-gray-300">
                                                    {modelProviders.find(p => p.id === config.model_provider_id)?.name || 'No model specified'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    <ModelConfigurations
                        modelConfigs={modelConfigs}
                        modelProviders={modelProviders}
                        selectedModelConfig={selectedModelConfig}
                        setSelectedModelConfig={setSelectedModelConfig}
                    />
                )}

                {/* Hidden input to store the selected model config ID */}
                <input
                    type="hidden"
                    name="user_model_config_id"
                    value={selectedModelConfig || ''}
                />
            </div>

            {/* Form actions */}
            {!readOnly && (
                <div className="flex justify-between w-full pt-4 border-t border-theme-border">
                    <NavButton label="Cancel" path=".." className="bg-theme-accent hover:bg-theme-accent-hover" />
                    <SubmitButton label={initialValues?.id ? "Update Agent" : "Create Agent"} className="bg-theme-primary hover:bg-theme-primary-hover" />
                </div>
            )}
        </Form>
    );
} 