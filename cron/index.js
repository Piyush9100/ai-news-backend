require("dotenv").config({
  path: "/home/u723371219/domains/slategrey-fox-987184.hostingersite.com/public_html/.env"
});
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { slugify } = require('../app/types');

require("fs").writeFileSync("/home/u723371219/env_test.log", String(process.env.NEXT_PUBLIC_SUPABASE_URL))

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATEGORIES = [
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health',
];

// ---------------- REFRESH NEWS ----------------
async function refreshCategory(category) {
  console.log(`🔄 Refreshing: ${category}`);

  const res = await fetch(
    `https://gnews.io/api/v4/top-headlines?category=${category}&country=in&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`
  );

  const json = await res.json();
  if (!json.articles?.length) return;

  const titles = json.articles.map((a) => a.title);
  const descriptions = json.articles.map((a) => a.description);
  const images = json.articles.map((a) => a.image);
  const articles = json.articles.map((a) => ({
    url: a.url,
    publishedAt: a.publishedAt,
    source: a.source,
    slug: slugify(a.title),
  }));

  const { data: cached } = await supabase
    .from('news_cache')
    .select('titles')
    .eq('category', category)
    .maybeSingle();

  const changed = !cached || !cached.titles || cached.titles[0] !== titles[0];

  if (!changed) {
    console.log(`✅ No change: ${category}`);
    return;
  }

  console.log(`🆕 Updating cache: ${category}`);

  const shortenRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/shorten-title`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titles }),
    }
  );

  const { shortenedTitles } = await shortenRes.json();

  const canvasRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-canvas`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headlines: shortenedTitles,
        images,
        category,
      }),
    }
  );

  const canvasData = await canvasRes.json();

  await supabase.from('news_cache').upsert(
    {
      category,
      titles,
      descriptions,
      shortened_titles: shortenedTitles,
      images: canvasData.images,
      articles,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'category' }
  );

  console.log(`✅ Cache updated: ${category}`);
}

// ---------------- INSTAGRAM AUTO POST ----------------
async function autoPostFromCache() {
  console.log('📸 Instagram auto-post');

  const { data: cache } = await supabase
    .from('news_cache')
    .select('articles, descriptions, images')
    .eq('category', 'general')
    .single();
  console.log('cache', cache);
  
  if (!cache) return;

  const { data: existing } = await supabase
    .from('instagram_posts')
    .select('slug');
  console.log('existing', existing);

  const existingSlugs = new Set(existing?.map((e) => e.slug));
  console.log('existingSlugs', existingSlugs);

  // Queue new posts
  for (let i = 0; i < cache.articles.length; i++) {
    try {
      const slug = cache.articles[i].slug;
      console.log('slug', slug);
      console.log('existingSlugs.has(slug)', existingSlugs.has(slug));
      if (existingSlugs.has(slug)) continue;

      const { data, error } = await supabase
        .from('instagram_posts')
        .insert([
          {
            slug,
            image_url: cache.images[i].publicUrl.split('?')[0],
            caption: cache.descriptions[i] || '',
            status: 'queued',
          }
        ]);

      if (error) {
        console.error('Insert error:', error);
      } else {
        console.log('Inserted:', data);
      }
      
    } catch (error) {
      console.log('error', error);
    }
  }

  // Pick one queued post
  const { data: post } = await supabase
    .from('instagram_posts')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!post) {
    console.log('📭 No queued Instagram posts');
    return;
  }

  const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_ID;
  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  const upload = await fetch(
    `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: post.image_url,
        caption: post.caption,
        access_token: ACCESS_TOKEN,
      }),
    }
  ).then((r) => r.json());

  if (!upload.id) throw new Error('Instagram upload failed');

  await fetch(`https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: upload.id,
      access_token: ACCESS_TOKEN,
    }),
  });

  await supabase
    .from('instagram_posts')
    .update({
      status: 'posted',
      posted_at: new Date().toISOString(),
    })
    .eq('id', post.id);

  console.log('✅ Instagram post published');
}

// ---------------- CRON ----------------
cron.schedule('0 */6 * * *', async () => {
  console.log('🕒 News Fetch Cron started');

  for (const category of CATEGORIES) {
    try {
      await refreshCategory(category);
    } catch (e) {
      console.error(`❌ ${category} failed`, e);
    }
  }
 
  console.log('🏁  News Fetch Cron finished');
});

// ---------------- CRON ----------------
cron.schedule('*/2 * * * *', async () => {
  console.log('🕒 post instagram cron');

  //--- comment this for insta stop run cron --- // 
  await autoPostFromCache();

  console.log('🏁 Finished Instagram Post Cron');
});

console.log('🚀 Cron jobs initialized...');

module.exports = {
  refreshCategory,
  autoPostFromCache,
};