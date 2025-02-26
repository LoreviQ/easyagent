import { type Provider } from "@supabase/supabase-js";
import { Form } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { useState } from "react";

import { getSupabaseAuth } from "~/utils/supabase";
import { type ProviderDetails, PROVIDERS } from "~/types/providers";

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const provider = formData.get("provider");
    const { supabase, headers } = getSupabaseAuth(request);

    const url = new URL(request.url);
    const redirectUrl = `${url.origin}/api/auth-callback`;

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as Provider,
            options: {
                redirectTo: redirectUrl,
            },
        });
        if (error) throw error;
        return redirect(data.url, { headers });
    } catch (error) {
        console.error(error);
        throw new Response("Failed to complete authentication", { status: 500 });
    }
}

export default function Login() {
    return (
        <div className="w-full max-w-md py-8 px-16 rounded-xl bg-theme-bg-card border border-theme-secondary space-y-4">
            <h3 className="text-4xl mb-8 text-center font-semibold text-theme-secondary">Login</h3>
            <div className="space-y-3">
                {PROVIDERS.map((provider) => (
                    <ProviderLoginButton key={provider.id} provider={provider} />
                ))}
            </div>
        </div>
    );
}

interface ProviderLoginButtonProps {
    provider: ProviderDetails;
}

function ProviderLoginButton({ provider }: ProviderLoginButtonProps) {
    const [bgColor, setBgColor] = useState(provider.colour);

    return (
        <Form method="post">
            <input type="hidden" name="provider" value={provider.id} />
            <button
                type="submit"
                className="w-full px-4 py-3 rounded-full font-semibold transition-colors flex items-center justify-start gap-8"
                style={{ backgroundColor: bgColor, color: provider.text }}
                onMouseEnter={() => setBgColor(provider.hoverColour)}
                onMouseLeave={() => setBgColor(provider.colour)}
            >
                {provider.icon && <provider.icon className="w-6 h-6" />}
                <span>Continue with {provider.name}</span>
            </button>
        </Form>
    );
}
