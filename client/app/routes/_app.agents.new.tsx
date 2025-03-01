import { useOutletContext } from "@remix-run/react";

import type { UserModelConfig, ModelProvider } from "~/types/database";
import { AgentForm } from "~/components/agentForm";


export default function NewAgent() {
    const { modelConfigs, modelProviders } = useOutletContext<{ modelConfigs: UserModelConfig[], modelProviders: ModelProvider[] }>();
    return (
        <div className="max-w-4xl mx-auto">
            <AgentForm
                modelConfigs={modelConfigs}
                modelProviders={modelProviders}
            />
        </div>
    );
} 