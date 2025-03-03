import { createClient } from '@supabase/supabase-js';
import { Character, ModelProviderName } from '@elizaos/core';

// Environment variables for Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const agentId = process.env.AGENT_ID || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is properly configured
export function validateSupabaseConfig(): boolean {
    if (!supabaseUrl || !supabaseKey || !agentId) {
        console.error('Supabase credentials not found. Please set SUPABASE_URL, SUPABASE_ANON_KEY and AGENT_ID environment variables.');
        return false;
    }
    return true;
}

// Function to get a character from Supabase by agent ID
export async function getCharacter(): Promise<Character> {
    // Get agent ID from environment variable
    if (!agentId) {
        process.exit(1);
    }

    // Query the Supabase database for the specific agent with joined model provider info
    const { data, error } = await supabase
        .from('agents')
        .select(`
            *,
            user_model_config:user_model_config_id (
                *,
                model_provider:model_provider_id (
                    name
                )
            )
        `)
        .eq('id', agentId)
        .single();

    if (error) {
        throw new Error(`Error fetching agent from Supabase: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Agent with ID ${agentId} not found in database`);
    }

    // Get model provider name from the joined data and convert to ModelProviderName enum
    let modelProviderStr = 'openrouter'; // Default
    if (data.user_model_config && data.user_model_config.model_provider) {
        modelProviderStr = data.user_model_config.model_provider.name;
    }

    // Convert string to ModelProviderName enum
    // Make sure the string matches one of the enum values
    const modelProvider = validateModelProvider(modelProviderStr);

    // Get API key from user model config
    let apiKey;
    if (data.user_model_config) {
        apiKey = data.user_model_config.api_key;
    }

    // Map database record to Character format
    return {
        id: data.id,
        name: data.name,
        username: data.name?.toLowerCase().replace(/\s+/g, ''),
        plugins: data.plugins || [],
        clients: data.clients || [],
        modelProvider: modelProvider,
        settings: {
            secrets: {
                // Add the API key from user_model_config to the appropriate secret field
                ...(apiKey && modelProvider === ModelProviderName.OPENAI ? { OPENAI_API_KEY: apiKey } : {}),
                ...(apiKey && modelProvider === ModelProviderName.ANTHROPIC ? { ANTHROPIC_API_KEY: apiKey } : {}),
                ...(apiKey && modelProvider === ModelProviderName.OPENROUTER ? { OPENROUTER: apiKey } : {}),
                ...(apiKey && modelProvider === ModelProviderName.GROQ ? { GROQ_API_KEY: apiKey } : {}),
                ...(apiKey && modelProvider === ModelProviderName.LLAMACLOUD ? { LLAMACLOUD_API_KEY: apiKey } : {}),
            },
        },
        system: data.system_prompt || '',
        // Required fields
        bio: data.bio ? [data.bio] : [],
        lore: data.lore ? [data.lore] : [], // Convert string to array
        messageExamples: data.message_examples || [[]],
        postExamples: data.post_examples || [],
        topics: data.topics || [],
        style: {
            all: data.style_all || [],
            chat: data.style_chat || [],
            post: data.style_post || [],
        },
        adjectives: data.adjectives || [],
    };
}

// Helper function to validate and convert string to ModelProviderName enum
function validateModelProvider(providerStr: string): ModelProviderName {
    // Check if the string is a valid enum value
    if (Object.values(ModelProviderName).includes(providerStr as ModelProviderName)) {
        return providerStr as ModelProviderName;
    }

    // Handle common mappings or variations
    const mappings: Record<string, ModelProviderName> = {
        'openai': ModelProviderName.OPENAI,
        'anthropic': ModelProviderName.ANTHROPIC,
        'claude': ModelProviderName.ANTHROPIC,
        'openrouter': ModelProviderName.OPENROUTER,
        'groq': ModelProviderName.GROQ,
        'llama_cloud': ModelProviderName.LLAMACLOUD,
        'llamacloud': ModelProviderName.LLAMACLOUD,
        'grok': ModelProviderName.GROK,
        'mistral': ModelProviderName.MISTRAL,
        'google': ModelProviderName.GOOGLE,
        'together': ModelProviderName.TOGETHER
    };

    if (mappings[providerStr.toLowerCase()]) {
        return mappings[providerStr.toLowerCase()];
    }

    // Default to OpenRouter if no match is found
    console.warn(`Unknown model provider "${providerStr}", defaulting to OpenRouter`);
    return ModelProviderName.OPENROUTER;
}