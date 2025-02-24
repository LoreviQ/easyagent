import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { getSupabaseAuth } from "~/utils/supabase";

export async function loader({ request }: { request: Request }) {
    const { supabase } = getSupabaseAuth(request);
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (session) {
        throw redirect("/dashboard");
    }
    return null;
}

export default function Auth() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-theme-bg to-theme-bg-secondary text-white flex items-center justify-center px-4">
            <Outlet />
        </div>
    );
}
