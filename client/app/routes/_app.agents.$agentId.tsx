import { useOutletContext, useParams } from "@remix-run/react";

import type { Agent, UserModelConfig, ModelProvider } from "~/types/database";
import { AgentForm } from "~/components/forms";

export default function AgentDetail() {
    const { agents, modelConfigs, modelProviders } = useOutletContext<{ agents: Agent[], modelConfigs: UserModelConfig[], modelProviders: ModelProvider[] }>();
    const { agentId } = useParams();
    const agent = agents.find(a => a.id === agentId);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Agent Details</h1>
            <AgentForm
                initialValues={agent}
                modelConfigs={modelConfigs}
                modelProviders={modelProviders}
                readOnly={true}
            />
        </div>
    );
} 