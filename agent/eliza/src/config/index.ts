import { Character, ModelProviderName, settings, validateCharacterConfig } from "@elizaos/core";
import yargs from "yargs";
import { validateSupabaseConfig, getCharacter } from '../lib/supabase/index.js';



export function parseArguments(): {
    character?: string;
    characters?: string;
} {
    try {
        return yargs(process.argv.slice(2))
            .option("character", {
                type: "string",
                description: "Path to the character JSON file",
            })
            .option("characters", {
                type: "string",
                description: "Comma separated list of paths to character JSON files",
            })
            .parseSync();
    } catch (error) {
        console.error("Error parsing arguments:", error);
        return {};
    }
}

export async function loadCharacters(
    charactersArg: string
): Promise<Character[]> {
    // Check if Supabase credentials are provided
    if (!validateSupabaseConfig()) {
        process.exit(1);
    }
    try {
        // Get character from Supabase
        const character = await getCharacter();

        // Validate the character
        validateCharacterConfig(character);

        // Return as a single element array since the rest of the code expects a list
        return [character];
    } catch (e) {
        console.error(`Error loading character: ${e}`);
        process.exit(1);
    }

    return [];
}

export function getTokenForProvider(
    provider: ModelProviderName,
    character: Character
) {
    switch (provider) {
        case ModelProviderName.OPENAI:
            return (
                character.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY
            );
        case ModelProviderName.LLAMACLOUD:
            return (
                character.settings?.secrets?.LLAMACLOUD_API_KEY ||
                settings.LLAMACLOUD_API_KEY ||
                character.settings?.secrets?.TOGETHER_API_KEY ||
                settings.TOGETHER_API_KEY ||
                character.settings?.secrets?.XAI_API_KEY ||
                settings.XAI_API_KEY ||
                character.settings?.secrets?.OPENAI_API_KEY ||
                settings.OPENAI_API_KEY
            );
        case ModelProviderName.ANTHROPIC:
            return (
                character.settings?.secrets?.ANTHROPIC_API_KEY ||
                character.settings?.secrets?.CLAUDE_API_KEY ||
                settings.ANTHROPIC_API_KEY ||
                settings.CLAUDE_API_KEY
            );
        case ModelProviderName.REDPILL:
            return (
                character.settings?.secrets?.REDPILL_API_KEY || settings.REDPILL_API_KEY
            );
        case ModelProviderName.OPENROUTER:
            return (
                character.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY
            );
        case ModelProviderName.GROK:
            return character.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY;
        case ModelProviderName.HEURIST:
            return (
                character.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY
            );
        case ModelProviderName.GROQ:
            return character.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY;
    }
}
