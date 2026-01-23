import { Request, Response } from 'express';

export async function shortenTitle(req: Request, res: Response) {
  try {
    const { titles } = req.body;
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!Array.isArray(titles)) {
      return res.status(400).json({
        error: "Titles array is required"
      });
    }

    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        error: "DEEPSEEK_API_KEY not configured"
      });
    }

    const shortenedTitles = await Promise.all(
      titles.map(async (title: string) => {
        try {
          const response = await fetch(
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

          const data: any = await response.json();
          return data.choices?.[0]?.message?.content?.trim() || title;
        } catch (err) {
          console.error("DeepSeek API Error:", err);
          return title;
        }
      })
    );

    res.json({ shortenedTitles });
  } catch (err) {
    console.error('Title shortening error:', err);
    res.status(500).json({
      error: "Title shortening failed"
    });
  }
}