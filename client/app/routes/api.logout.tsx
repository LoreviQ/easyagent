import { redirect } from "@remix-run/node";

import { getSupabaseAuth } from "~/utils/supabase";

export async function action({ request }: { request: Request }) {
    const { supabase, headers } = getSupabaseAuth(request);
    await supabase.auth.signOut();

    return redirect("/", {
        headers: headers,
    });
}
