"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCanvas = generateCanvas;
const puppeteer_1 = __importDefault(require("puppeteer"));
const supabase_server_1 = require("../lib/supabase-server");
async function generateCanvas(req, res) {
    try {
        const { headlines, images, category } = req.body;
        if (!Array.isArray(headlines) || !category) {
            return res.status(400).json({
                error: "Headlines array & category required"
            });
        }
        const safeCategory = category.replace(/\s+/g, "-").toLowerCase();
        const refreshId = Date.now();
        const browser = await puppeteer_1.default.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true
        });
        const generatedImages = [];
        for (let i = 0; i < headlines.length; i++) {
            const page = await browser.newPage();
            const bgImage = images?.[i] || `${process.env.NEXT_PUBLIC_BASE_URL}/blackbg.png`;
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
            const { data: uploadData, error: uploadError } = await (0, supabase_server_1.getSupabaseServer)().storage
                .from("news-images")
                .upload(filePath, buffer, {
                contentType: "image/png",
                upsert: false,
            });
            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                throw new Error(`Failed to upload image: ${uploadError.message}`);
            }
            const { data: urlData } = (0, supabase_server_1.getSupabaseServer)().storage
                .from("news-images")
                .getPublicUrl(filePath);
            if (!urlData || !urlData.publicUrl) {
                throw new Error('Failed to get public URL for uploaded image');
            }
            generatedImages.push({ publicUrl: urlData.publicUrl });
        }
        await browser.close();
        res.json({
            images: generatedImages,
            fromCache: false,
        });
    }
    catch (err) {
        console.error('Canvas generation error:', err);
        res.status(500).json({
            error: "Canvas generation failed"
        });
    }
}
//# sourceMappingURL=generate-canvas.js.map