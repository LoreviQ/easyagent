import { useState } from "react";

interface ConfirmationOverlayProps {
    heading: string;
    subheading: string;
    continueButtonLabel: string;
    cancelButtonLabel?: string;
    onContinue: () => void;
    isLoading?: boolean;
    continueButtonClassName?: string;
}

interface UseConfirmationOverlayResult {
    ConfirmationOverlayComponent: React.ReactNode;
    showConfirmation: (configId?: string) => void;
    hideConfirmation: () => void;
    confirmationData: string | null;
}

export function useConfirmationOverlay({
    heading,
    subheading,
    continueButtonLabel,
    cancelButtonLabel = "Cancel",
    onContinue,
    isLoading = false,
    continueButtonClassName = "bg-theme-primary hover:bg-theme-primary-hover"
}: ConfirmationOverlayProps): UseConfirmationOverlayResult {
    const [showOverlay, setShowOverlay] = useState(false);
    const [data, setData] = useState<string | null>(null);

    const showConfirmation = (data?: string) => {
        if (data) setData(data);
        setShowOverlay(true);
    };

    const hideConfirmation = () => {
        setShowOverlay(false);
        setTimeout(() => setData(null), 300);
    };

    const handleContinue = () => {
        onContinue();
        // Don't hide automatically - let the caller decide when to hide
        // based on the operation result
    };

    const ConfirmationOverlayComponent = (
        <ConfirmationOverlay
            heading={heading}
            subheading={subheading}
            continueButtonLabel={continueButtonLabel}
            cancelButtonLabel={cancelButtonLabel}
            onContinue={handleContinue}
            onCancel={hideConfirmation}
            isLoading={isLoading}
            showOverlay={showOverlay}
            continueButtonClassName={continueButtonClassName}
        />
    );

    return {
        ConfirmationOverlayComponent,
        showConfirmation,
        hideConfirmation,
        confirmationData: data
    };
}

// Keep the original component for direct use if needed
export function ConfirmationOverlay({
    heading,
    subheading,
    continueButtonLabel,
    cancelButtonLabel = "Cancel",
    onContinue,
    onCancel,
    isLoading = false,
    showOverlay,
    continueButtonClassName = "bg-theme-primary hover:bg-theme-primary-hover"
}: ConfirmationOverlayProps & { onCancel: () => void; showOverlay: boolean }) {
    if (!showOverlay) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-theme-surface p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">{heading}</h3>
                <p className="mb-6">{subheading}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-theme-surface-secondary hover:bg-theme-surface-tertiary rounded"
                    >
                        {cancelButtonLabel}
                    </button>
                    <button
                        onClick={onContinue}
                        disabled={isLoading}
                        className={`px-4 py-2 ${continueButtonClassName} rounded flex items-center`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            continueButtonLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
} 