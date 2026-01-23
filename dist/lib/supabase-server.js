"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseServer = getSupabaseServer;
const supabase_js_1 = require("@supabase/supabase-js");
let supabaseServer = null;
function getSupabaseServer() {
    if (!supabaseServer) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        }
        supabaseServer = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return supabaseServer;
}
//# sourceMappingURL=supabase-server.js.map