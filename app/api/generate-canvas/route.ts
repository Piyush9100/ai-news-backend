import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { supabaseServer } from "../../../lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { headlines, images, category } = await req.json();

    if (!Array.isArray(headlines) || !category) {
      return NextResponse.json(
        { error: "Headlines array & category required" },
        { status: 400 }
      );
    }

    const safeCategory = category.replace(/\s+/g, "-").toLowerCase();
    const refreshId = Date.now();

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const generatedImages: { publicUrl: string }[] = [];

    for (let i = 0; i < headlines.length; i++) {
      const page = await browser.newPage();

      const bgImage =
        images?.[i] || `${process.env.NEXT_PUBLIC_BASE_URL}/blackbg.png`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
          </head>
          <body style="margin:0;padding:0;background:#fff;">
            <div
              style="
                width:1015px;
                height:1350px;
                display:flex;
                flex-direction:column;
                position:relative;
                overflow:hidden;
                font-family:Arial, sans-serif;
              "
            >
              <!-- IMAGE SECTION -->
              <div
                style="
                  height:70%;
                  background:url('${bgImage}') center center / cover no-repeat;
                "
              ></div>

              <!-- NEWS BADGE -->
              <div
                style="
                  position:absolute;
                  top:calc(70% - 65px);
                  left:50%;
                  width:350px;
                  transform:translateX(-50%);
                  display:flex;
                  align-items:center;
                  gap:12px;
                  background:#ffffff;
                  padding:10px 28px;
                  border-radius:60px;
                  box-shadow:0 6px 20px rgba(0,0,0,0.15);
                "
              >
                 <img
                  src="${process.env.NEXT_PUBLIC_BASE_URL}/news-24x7.png"
                  style="
                    width:100%;
                    height:auto;
                    object-fit:cover;
                    background:#fff;
                    border:4px solid #fff;
                  "
                />
              </div>

              <!-- TITLE -->
              <div
                style="
                  flex:1;
                  display:flex;
                  align-items:flex-start;
                  justify-content:center;
                  padding:80px 40px 30px;
                  text-align:center;
                "
              >
                <h1
                  style="
                    font-size:70px;
                    line-height:1.15;
                    margin:0;
                    font-weight:700;
                    word-break:break-word;
                  "
                >
                  ${headlines[i]}
                </h1>
              </div>
            </div>
          </body>
        </html>
        `;

      await page.setViewport({ width: 1015, height: 1350 });
      await page.setContent(html);

      const buffer = await page.screenshot({ type: "png" });
      await page.close();

      const filePath = `${safeCategory}/${refreshId}-${i}.png`;

      await supabaseServer.storage
        .from("news-images")
        .upload(filePath, buffer, {
          contentType: "image/png",
          upsert: false,
        });

      const { data } = supabaseServer.storage
        .from("news-images")
        .getPublicUrl(filePath);

      generatedImages.push({ publicUrl: data.publicUrl });
    }

    await browser.close();

    return NextResponse.json({
      images: generatedImages,
      fromCache: false,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Canvas generation failed" },
      { status: 500 }
    );
  }
}
