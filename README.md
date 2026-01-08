# Express Cron Service

A Node.js Express service with scheduled cron jobs for news fetching and Instagram auto-posting using node-cron.

## Features

- **News Fetching**: Automatically fetches news from GNews API every 6 hours
- **Instagram Auto-posting**: Posts queued content to Instagram every 15 minutes
- **Supabase Integration**: Stores news cache and Instagram post queue
- **Health Monitoring**: Health check and cron status endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Endpoints

- `GET /` - Basic service info
- `GET /health` - Health check endpoint with cron job status
- `GET /cron-status` - Detailed cron job information

## Cron Jobs

### News Fetch Cron (`0 */6 * * *`)
- Runs every 6 hours
- Fetches news from 9 categories: general, world, nation, business, technology, entertainment, sports, science, health
- Updates Supabase cache with shortened titles and generated images
- Only updates if content has changed

### Instagram Auto Post Cron (`*/15 * * * *`)
- Runs every 15 minutes
- Queues new posts from general news category
- Posts one queued item to Instagram Business API
- Updates post status in database

### Server Heartbeat (`* * * * *`)
- Runs every minute
- Simple server status logging

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GNEWS_API_KEY` - GNews API key for fetching news
- `NEXT_PUBLIC_BASE_URL` - Base URL for API calls
- `INSTAGRAM_BUSINESS_ID` - Instagram Business Account ID
- `INSTAGRAM_ACCESS_TOKEN` - Instagram API access token
- `PORT` - Server port (default: 3000)

## Database Schema

The service expects these Supabase tables:

### news_cache
- `category` (text, primary key)
- `titles` (text[])
- `descriptions` (text[])
- `shortened_titles` (text[])
- `images` (jsonb)
- `articles` (jsonb)
- `updated_at` (timestamp)

### instagram_posts
- `id` (uuid, primary key)
- `slug` (text)
- `image_url` (text)
- `caption` (text)
- `status` (text) - 'queued' or 'posted'
- `created_at` (timestamp)
- `posted_at` (timestamp)

## Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```