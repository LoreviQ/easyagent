import { useOutletContext } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { format } from "date-fns";

import { ContentCard, HeadingBreak } from "~/components/cards";
import type { Agent } from "~/types/database";

type AgentsContext = {
    agents: Agent[];
};

export default function AgentsIndex() {
    const { agents } = useOutletContext<AgentsContext>();

    return (
        <div className="space-y-6">
            <ContentCard title="Your Agents">
                {agents.length > 0 ? (
                    <>
                        <HeadingBreak label="Your AI Agents" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                            {agents.map((agent) => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-gray-400">No agents found</p>
                    </div>
                )}
                <div className="text-center mt-6">
                    <Link
                        to="/agents/new"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary hover:bg-theme-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
                    >
                        Create New Agent
                    </Link>
                </div>
            </ContentCard>
        </div>
    );
}

function AgentCard({ agent }: { agent: Agent }) {
    const formattedDate = agent.updated_at
        ? format(new Date(agent.updated_at), 'MMM d, yyyy')
        : 'Unknown date';

    return (
        <div className="bg-theme-surface-secondary rounded-lg overflow-hidden shadow-md relative">
            {/* Public/Private indicator */}
            <div className="absolute top-2 right-2 z-10">
                <span className={`px-2 py-1 text-xs rounded-full ${agent.is_public
                    ? 'bg-theme-success/20 text-theme-success'
                    : 'bg-theme-error/20 text-theme-error'
                    }`}>
                    {agent.is_public ? 'Public' : 'Private'}
                </span>
            </div>

            {/* Avatar */}
            <div className="h-40 flex items-center justify-center bg-theme-surface p-4">
                {agent.avatar_url ? (
                    <img
                        src={agent.avatar_url}
                        alt={`${agent.name}'s avatar`}
                        className="h-full w-auto object-contain rounded-md"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-theme-primary/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-theme-primary">
                            {agent.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Agent details */}
            <div className="p-4 text-center">
                <h3 className="font-medium text-lg truncate">{agent.name}</h3>
                <p className="text-sm text-gray-400 mt-1">Last updated: {formattedDate}</p>
            </div>
        </div>
    );
} 