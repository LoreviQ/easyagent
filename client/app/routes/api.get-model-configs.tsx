import { redirect } from "@remix-run/node";
import { getSupabaseAuth } from "~/utils/supabase";
import type { UserModelConfig, ModelProvider } from "~/types/database";

