"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const supabase_server_1 = require("../../../lib/supabase-server");
async function GET() {
    const { data, error } = await supabase_server_1.supabaseServer.from("news_cache").select("*");
    if (error) {
        return server_1.NextResponse.json({ ok: false, error: error.message });
    }
    return server_1.NextResponse.json({ ok: true, data });
}
//# sourceMappingURL=route.js.map