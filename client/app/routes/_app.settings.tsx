import { useOutletContext, useActionData } from "@remix-run/react";
import type { User, Provider, UserIdentity } from "@supabase/supabase-js";
import { type FC, useEffect } from "react";
import { Form } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";
import { SubmitButton } from "~/components/buttons";
import { HeadingBreak } from "~/components/cards";
import { PROVIDERS } from "~/types/providers";

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
                    redirectTo: `${process.env.APP_URL}/auth-callback?next=/settings`,
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
    const userData = useOutletContext<User>();
    const actionData = useActionData<typeof action>();

    useEffect(() => {
        if (actionData?.error) {
            alert(`ERR - ${actionData.status}\n${actionData.error}`);
        }
    }, [actionData]);

    const connectedProviders = PROVIDERS.filter((provider) =>
        userData.identities?.some((identity) => identity.provider === provider.id)
    );

    const nonConnectedProviders = PROVIDERS.filter(
        (provider) => !userData.identities?.some((identity) => identity.provider === provider.id)
    );
    return (
        <div className="bg-theme-bg-card/70 rounded-lg p-6">
            <h1 className="text-xl font-semibold mb-4">Accounts</h1>
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
        </div>
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
                {Icon && <Icon />}
                <span className="font-medium">{name}</span>
            </div>
            <Form method="post">
                <input type="hidden" name="provider" value={id} />
                <input type="hidden" name="connected" value={connected ? "1" : "0"} />
                {connected ? (
                    <SubmitButton label="Disconnect" className="bg-red-500 hover:bg-red-400" />
                ) : (
                    <SubmitButton label="Connect" className="bg-theme-primary hover:bg-theme-primary-hover" />
                )}
            </Form>
        </div>
    );
}
