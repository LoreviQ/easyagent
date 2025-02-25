import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";

interface ModelProvider {
    id: string;
    name: string;
}

// Define the response type for the form submission
interface FormActionResponse {
    success?: boolean;
    error?: string;
    data?: any;
}

export enum ModelConfigFormType {
    CREATE = "create",
    EDIT = "edit",
    HIDDEN = "hidden",
}

interface ModelConfigFormProps {
    actionRoute: string;
    initialValues?: {
        id?: string;
        name: string;
        model_provider_id: string;
        api_key: string;
    };
    modelProviders?: ModelProvider[];
    onCancel: () => void;
    onSuccess?: () => void;
}

export function ModelConfigForm({
    actionRoute,
    initialValues,
    modelProviders: providedModelProviders,
    onCancel,
    onSuccess
}: ModelConfigFormProps) {
    const formFetcher = useFetcher<FormActionResponse>();
    const providersFetcher = useFetcher<{ modelProviders: ModelProvider[] }>();
    const isSubmitting = formFetcher.state === "submitting";
    const isEdit = !!initialValues?.id;
    const [apiKeyChanged, setApiKeyChanged] = useState(false);

    // Fetch model providers only if not provided
    useEffect(() => {
        if (!providedModelProviders && providersFetcher.state === "idle" && !providersFetcher.data) {
            providersFetcher.load("/api/get-model-providers");
        }
    }, [providersFetcher, providedModelProviders]);

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

    // Use provided model providers if available, otherwise use fetched ones
    const modelProviders = providedModelProviders || providersFetcher.data?.modelProviders || [];
    const isLoadingProviders = !providedModelProviders && (providersFetcher.state !== "idle" || !providersFetcher.data);

    return (
        <div className="p-4 bg-theme-surface-secondary rounded-lg">
            <h3 className="font-medium text-lg mb-4">
                {isEdit ? "Edit Configuration" : "Create New Configuration"}
            </h3>
            <formFetcher.Form method="post" action={actionRoute}>
                {/* Hidden ID field for edits */}
                {isEdit && <input type="hidden" name="id" value={initialValues.id} />}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Configuration Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            defaultValue={initialValues?.name || ""}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            placeholder="My Configuration"
                        />
                    </div>

                    <div>
                        <label htmlFor="model_provider_id" className="block text-sm font-medium mb-1">
                            Model Provider
                        </label>
                        <select
                            id="model_provider_id"
                            name="model_provider_id"
                            required
                            defaultValue={initialValues?.model_provider_id || ""}
                            className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                            disabled={isLoadingProviders}
                        >
                            <option value="">
                                {isLoadingProviders ? "Loading providers..." : "Select a provider"}
                            </option>
                            {modelProviders.map(provider => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="api_key" className="block text-sm font-medium mb-1">
                            API Key {isEdit && !apiKeyChanged && <span className="text-xs text-gray-400">(enter new key to change)</span>}
                        </label>
                        <input
                            type="password"
                            id="api_key"
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

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-theme-surface-secondary hover:bg-theme-surface-tertiary rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoadingProviders}
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