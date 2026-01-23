/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase-server";
import { slugify } from "../../../types";

export async function POST(req: Request) {
  const { category } = await req.json();

  if (!category) {
    return NextResponse.json({ error: "Category required" }, { status: 400 });
  }

  console.log("🔄 Refreshing category:", category);

  //Fetch From GNews
  const res = await fetch(
    `https://gnews.io/api/v4/top-headlines?category=${category}&country=in&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`
  );
  const data = await res.json();

  if (!data.articles?.length) {
    return NextResponse.json({ error: "No articles" }, { status: 400 });
  }

  const titles = data.articles.map((a: any) => a.title);
  const descriptions = data.articles.map((a: any) => a.description);
  const images = data.articles.map((a: any) => a.image);
  const articles = data.articles.map((a: any) => ({
    url: a.url,
    publishedAt: a.publishedAt,
    source: a.source,
    slug: slugify(a.title),
  }));

  //Shorten titles
  const shortenRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/shorten-title`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titles }),
    }
  );
  const shortenData = await shortenRes.json();

  //Generate canvas
  const canvasRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-canvas`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headlines: shortenData.shortenedTitles,
        images,
        category,
      }),
    }
  );
  const canvasData = await canvasRes.json();

  //UPSERT cache
  await supabaseServer.from("news_cache").upsert(
    {
      category,
      articles,
      titles,
      descriptions,
      shortened_titles: shortenData.shortenedTitles,
      images: canvasData.images,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "category" }
  );

  return NextResponse.json({ success: true });
}
