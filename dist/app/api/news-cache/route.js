"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const supabase_server_1 = require("../../../lib/supabase-server");
async function GET(req) {
    try {
        const url = new URL(req.url);
        const category = url.searchParams.get("category");
        if (!category) {
            return server_1.NextResponse.json({ error: "Category is required" }, { status: 400 });
        }
        console.log("📥 news-cache request:", category);
        //Read cache
        const { data: cached, error } = await supabase_server_1.supabaseServer
            .from("news_cache")
            .select("*")
            .eq("category", category)
            .single();
        if (error && error.code !== "PGRST116") {
            console.error("❌ Supabase read error:", error);
        }
        //Cache exists → return immediately
        if (cached) {
            console.log("✅ Returning cached data:", category);
            return server_1.NextResponse.json({
                fromCache: true,
                articles: cached.articles,
                titles: cached.titles,
                descriptions: cached.descriptions,
                shortened_titles: cached.shortened_titles,
                images: cached.images,
                updated_at: cached.updated_at,
            });
        }
        //Cache empty → AUTO-SEED (RUNS ONCE)
        console.log("🆕 Cache empty, seeding:", category);
        const seedRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/internal/refresh-category`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category }),
        });
        if (!seedRes.ok) {
            console.error("❌ Seed failed");
            return server_1.NextResponse.json({ error: "Failed to seed cache" }, { status: 500 });
        }
        //Read again after seed
        const { data: fresh } = await supabase_server_1.supabaseServer
            .from("news_cache")
            .select("*")
            .eq("category", category)
            .single();
        if (!fresh) {
            return server_1.NextResponse.json({ error: "Cache still empty after seed" }, { status: 500 });
        }
        console.log("✅ Seed successful:", category);
        return server_1.NextResponse.json({
            fromCache: false,
            articles: fresh.articles,
            titles: fresh.titles,
            descriptions: fresh.descriptions,
            shortened_titles: fresh.shortened_titles,
            images: fresh.images,
            updated_at: fresh.updated_at,
        });
    }
    catch (err) {
        console.error("❌ news-cache crash:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map