import { useOutletContext } from "@remix-run/react";

import type { UserModelConfig, ModelProvider } from "~/types/database";
import { AgentForm } from "~/components/forms";


export default function NewAgent() {
    const { modelConfigs, modelProviders } = useOutletContext<{ modelConfigs: UserModelConfig[], modelProviders: ModelProvider[] }>();
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Create New Agent</h1>
            <AgentForm
                modelConfigs={modelConfigs}
                modelProviders={modelProviders}
            />
        </div>
    );
} 