
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";


// For auth-related operations
export function getSupabaseAuth(
    request: Request,
) {
    const headers = new Headers();
    const subabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return parseCookieHeader(request.headers.get("Cookie") ?? "");
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        headers.append("Set-Cookie", serializeCookieHeader(name, value, options))
                    );
                },
            },
        }
    )
    return {
        supabase: subabase,
        headers: headers,
    }
}