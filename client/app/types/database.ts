// Database types for the application

export type Agent = {
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