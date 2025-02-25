import { useOutletContext, useActionData, useLoaderData } from "@remix-run/react";
import type { User, Provider, UserIdentity } from "@supabase/supabase-js";
import { type FC, useEffect, useState } from "react";
import { Form, useFetcher } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";
import { SubmitButton } from "~/components/buttons";
import { HeadingBreak, ContentCard } from "~/components/cards";
import { PROVIDERS } from "~/types/providers";

export async function loader({ request }: { request: Request }) {
    const { supabase } = getSupabaseAuth(request);

    // Get the current user with getUser() for better security
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
        modelConfigs: modelConfigs || [],
        modelProviders: modelProviders || []
    };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const provider = formData.get("provider");
    const connected = formData.get("connected") === "1";
    const { supabase, headers } = getSupabaseAuth(request);
    try {
        if (connected) {
            // Disconnect identity
            const { data } = await supabase.auth.getUserIdentities();
            if (!data?.identities) throw new Error("No identities found");
            const matchingIdentity = data.identities.find((identity: UserIdentity) => identity.provider === provider);
            if (!matchingIdentity) throw new Error("Identity not found");
            const { error } = await supabase.auth.unlinkIdentity(matchingIdentity);
            if (error) throw error;
            return Response.json({ status: 200 });
        } else {
            // Connect identity
            const { data, error } = await supabase.auth.linkIdentity({
                provider: provider as Provider,
                options: {
                    redirectTo: `${process.env.APP_URL}/api/auth-callback?next=/settings`,
                },
            });
            if (error) throw error;
            return redirect(data.url, { headers });
        }
    } catch (error: unknown) {
        console.error(error);
        // Type guard for Error object
        if (error instanceof Error) {
            return Response.json({ error: error.message, status: 500 }, { status: 500 });
        }
        return Response.json({ error: "An unknown error occurred", status: 500 }, { status: 500 });
    }
}

export default function Settings() {
    // alert generated by action
    const actionData = useActionData<typeof action>();

    useEffect(() => {
        if (actionData?.error) {
            alert(`ERR - ${actionData.status}\n${actionData.error}`);
        }
    }, [actionData]);

    return (
        <div className="space-y-6">
            <ModelConfigurations />
            <Accounts />
        </div>
    );
}

// Displays the user's model configurations
function ModelConfigurations() {
    const { modelConfigs, modelProviders } = useLoaderData<typeof loader>();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === "submitting";

    return (
        <ContentCard title="Model Configurations">
            {modelConfigs.length > 0 ? (
                <div className="space-y-4">
                    <HeadingBreak label="Your Model Configurations" />
                    <div className="space-y-2">
                        {modelConfigs.map((config) => (
                            <div key={config.id} className="flex items-center justify-between py-3 px-4 bg-theme-surface-secondary rounded-lg">
                                <div>
                                    <h3 className="font-medium text-lg">{config.name || 'Unnamed Configuration'}</h3>
                                    <p className="text-sm text-gray-300">{modelProviders.find(p => p.id === config.model_provider_id)?.name || 'No model specified'}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 bg-theme-primary hover:bg-theme-primary-hover rounded text-sm">
                                        Edit
                                    </button>
                                    <button className="px-3 py-1 bg-theme-error hover:bg-theme-error-hover rounded text-sm">
                                        Delete
                                    </button>
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

            {/* Form for creating new configuration */}
            {showCreateForm ? (
                <div className="mt-4 p-4 bg-theme-surface-secondary rounded-lg">
                    <h3 className="font-medium text-lg mb-4">Create New Configuration</h3>
                    <fetcher.Form method="post" action="/api/create-model-config">
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
                                    className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                                >
                                    <option value="">Select a provider</option>
                                    {modelProviders.map(provider => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="api_key" className="block text-sm font-medium mb-1">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    id="api_key"
                                    name="api_key"
                                    required
                                    className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                                    placeholder="sk-..."
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
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
                    </fetcher.Form>
                </div>
            ) : (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover rounded"
                    >
                        Create New Configuration
                    </button>
                </div>
            )}
        </ContentCard>
    );
}

// Displays the connected accounts and allows the user to connect or disconnect from them
function Accounts() {
    const userData = useOutletContext<User>();
    const connectedProviders = PROVIDERS.filter((provider) =>
        userData.identities?.some((identity) => identity.provider === provider.id)
    );

    const nonConnectedProviders = PROVIDERS.filter(
        (provider) => !userData.identities?.some((identity) => identity.provider === provider.id)
    );
    return (
        <ContentCard title="Accounts">
            <HeadingBreak label="Connected Accounts" />
            <div className="space-y-2">
                {connectedProviders.map((provider) => (
                    <ProviderDetails
                        id={provider.id}
                        name={provider.name}
                        Icon={provider.icon}
                        connected={true}
                        key={provider.id}
                    />
                ))}
            </div>
            {nonConnectedProviders.length > 0 && (
                <>
                    <HeadingBreak label="Other Accounts" colour="red" />
                    <div className="space-y-2">
                        {nonConnectedProviders.map((provider) => (
                            <ProviderDetails
                                id={provider.id}
                                name={provider.name}
                                Icon={provider.icon}
                                connected={false}
                                key={provider.id}
                            />
                        ))}
                    </div>
                </>
            )}
        </ContentCard>
    );
}

interface ProviderDetailsProps {
    id: string;
    name: string;
    Icon?: FC<{ className?: string }>;
    connected: boolean;
}
function ProviderDetails({ id, name, Icon, connected }: ProviderDetailsProps) {
    return (
        <div key={id} className="flex items-center justify-between py-2 px-4 bg-theme-surface-secondary rounded-lg">
            <div className="flex items-center space-x-3">
                {Icon && <Icon className="w-6 h-6" />}
                <span className="font-medium">{name}</span>
            </div>
            <Form method="post">
                <input type="hidden" name="provider" value={id} />
                <input type="hidden" name="connected" value={connected ? "1" : "0"} />
                {connected ? (
                    <SubmitButton label="Disconnect" className="bg-theme-error hover:bg-theme-error-hover" />
                ) : (
                    <SubmitButton label="Connect" className="bg-theme-success hover:bg-theme-success-hover" />
                )}
            </Form>
        </div>
    );
}
