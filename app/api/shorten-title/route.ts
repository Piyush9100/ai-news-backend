import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { titles } = await req.json();
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  const shortenedTitles = await Promise.all(
    titles.map(async (title: string) => {
      try {
        const res = await fetch(
          "https://api.deepseek.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "user",
                  content: `Summarize the following headline into a shorter, catchy headline under 15 words. Do NOT include explanations or article references.\n\nOriginal: ${title}`,
                },
              ],
              max_tokens: 60,
              temperature: 0.7,
            }),
          }
        );

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || title;
      } catch (err) {
        console.error("DeepSeek API Error:", err);
        return title;
      }
    })
  );

  return NextResponse.json({ shortenedTitles });
}
