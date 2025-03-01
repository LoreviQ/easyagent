import { useOutletContext, useParams } from "@remix-run/react";

import type { Agent, UserModelConfig, ModelProvider } from "~/types/database";
import { AgentForm } from "~/components/agentForm";

export default function AgentDetail() {
    const { agents, modelConfigs, modelProviders } = useOutletContext<{ agents: Agent[], modelConfigs: UserModelConfig[], modelProviders: ModelProvider[] }>();
    const { agentId } = useParams();
    const agent = agents.find(a => a.id === agentId);

    return (
        <div className="max-w-4xl mx-auto">
            <AgentForm
                initialValues={agent}
                modelConfigs={modelConfigs}
                modelProviders={modelProviders}
                initialReadOnly={true}
                title={"Agent Details"}
            />
        </div>
    );
} 