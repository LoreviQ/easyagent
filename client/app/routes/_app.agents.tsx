import { useLoaderData, redirect } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { format } from "date-fns";

import { getSupabaseAuth } from "~/utils/supabase";
import { ContentCard, HeadingBreak } from "~/components/cards";
import { ActionButton } from "~/components/buttons";

// Define the Agent type based on the database schema
type Agent = {
    id: string;
    created_at: string;
    updated_at: string;
    owner_id: string;
    is_public: boolean;
    avatar_url: string | null;
    name: string;
    system_prompt: string | null;
    bio: string | null;
    lore: string | null;
    user_model_config_id: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError);
        throw redirect("/login");
    }

    // Fetch user's agents
    const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

    if (agentsError) {
        console.error("Error fetching agents:", agentsError);
    }

    return {
        agents: agents || []
    };
}

export default function Agent() {
    const { agents } = useLoaderData<typeof loader>();

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
                    <ActionButton label="Create New Agent" onClick={() => {/* TODO: Implement create agent */ }} />
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
