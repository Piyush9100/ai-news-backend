import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseServer.from("news_cache").select("*");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }

  return NextResponse.json({ ok: true, data });
}
