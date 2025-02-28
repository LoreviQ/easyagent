import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { useConfirmationOverlay } from "~/components/overlays";
import { HeadingBreak } from "~/components/cards";
import { ActionButton } from "~/components/buttons";
import { ModelConfigForm, FormActionResponse } from "~/components/forms";
import type { UserModelConfig, ModelProvider } from "~/types/database";

// Displays the user's model configurations
interface ModelConfigurationsProps {
    modelConfigs: UserModelConfig[];
    modelProviders: ModelProvider[];
    // Optional for radio selection
    selectedModelConfig?: string | null;
    setSelectedModelConfig?: (id: string) => void;
}

export function ModelConfigurations({
    modelConfigs,
    modelProviders,
    selectedModelConfig,
    setSelectedModelConfig
}: ModelConfigurationsProps) {
    const [formHidden, setFormHidden] = useState(true);
    const [initialValues, setInitialValues] = useState<UserModelConfig | null>(null);
    const deleteFetcher = useFetcher<FormActionResponse>();

    // Determine if we're in selection mode
    const isSelectionMode = selectedModelConfig !== undefined && setSelectedModelConfig !== undefined;

    // Helper function to reset form state
    const hideForm = () => {
        setInitialValues(null);
        setFormHidden(true);
    };

    // Execute delete when confirmed
    const executeDelete = () => {
        if (!deleteConfirmation.confirmationData) return;

        deleteFetcher.submit(
            { id: deleteConfirmation.confirmationData },
            { method: "post", action: "/api/delete-model-config" }
        );
    };

    // Custom overlay hook
    const deleteConfirmation = useConfirmationOverlay({
        heading: "Confirm Delete",
        subheading: "Are you sure you want to delete this model configuration? This action cannot be undone.",
        continueButtonLabel: "Delete",
        onContinue: executeDelete,
        isLoading: deleteFetcher.state === "submitting",
        continueButtonClassName: "bg-theme-error hover:bg-theme-error-hover"
    });

    // Clear confirmation when delete is complete
    useEffect(() => {
        if (deleteFetcher.data?.success) {
            deleteConfirmation.hideConfirmation();
        } else if (deleteFetcher.data?.error) {
            alert(`Error: ${deleteFetcher.data.error}`);
            deleteConfirmation.hideConfirmation();
        }
    }, [deleteFetcher.data]);

    return (
        <>
            {modelConfigs.length > 0 ? (
                <div className="space-y-4">
                    <HeadingBreak label="Your Model Configurations" />
                    <div className="space-y-2">
                        {modelConfigs.map((config) => (
                            <div key={config.id} className="flex items-center justify-between py-3 px-4 bg-theme-surface-secondary rounded-lg">
                                <div className="flex items-center flex-1">
                                    {isSelectionMode && (
                                        <input
                                            type="radio"
                                            id={`config-${config.id}`}
                                            name="user_model_config_id"
                                            value={config.id}
                                            checked={selectedModelConfig === config.id}
                                            onChange={() => setSelectedModelConfig(config.id)}
                                            className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border mr-3"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-lg">{config.name || 'Unnamed Configuration'}</h3>
                                        <p className="text-sm text-gray-300">
                                            {modelProviders.find(p => p.id === config.model_provider_id)?.name || 'No model specified'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <ActionButton
                                        label="Edit"
                                        className="px-3 py-1 text-sm"
                                        onClick={() => {
                                            setInitialValues(config);
                                            setFormHidden(false);
                                        }}
                                    />
                                    <ActionButton
                                        label="Delete"
                                        className="px-3 py-1 text-sm bg-theme-error hover:bg-theme-error-hover"
                                        onClick={() => deleteConfirmation.showConfirmation(config.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-6 text-center">
                    <p className="text-gray-400">No model configurations found</p>
                </div>
            )}

            {/* Edit form */}
            {formHidden ? (
                <div className="text-center">
                    <ActionButton label="Create New Configuration" onClick={() => setFormHidden(false)} />
                </div>
            ) : (
                <div>
                    <ModelConfigForm
                        modelProviders={modelProviders}
                        initialValues={initialValues}
                        onCancel={hideForm}
                        onSuccess={hideForm}
                    />
                </div>
            )}
            {deleteConfirmation.ConfirmationOverlayComponent}
        </>
    );
}