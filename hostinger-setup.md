# Hostinger Deployment Guide - WORKING VERSION

## ✅ Status: FULLY COMPATIBLE & FIXED
This version has been tested and works perfectly with proper PNG image generation!

## Prerequisites
1. Hostinger Premium or Business hosting plan (Node.js support required)
2. Node.js version 18+ enabled in Hostinger control panel

## What's Fixed
- ❌ Removed problematic `canvas` library (requires Cairo/Pango)
- ✅ Implemented Sharp library for proper SVG to PNG conversion
- ✅ Fixed corrupted image generation - images are now valid PNG files
- ✅ Uses `axios` instead of `fetch` for better compatibility
- ✅ All dependencies install successfully
- ✅ Server runs without errors
- ✅ All API endpoints working
- ✅ Images open correctly in browsers and image viewers

## Deployment Steps

### 1. Upload Files
Upload all project files to your Hostinger public_html directory (or subdirectory)

### 2. Environment Variables
Create `.env` file in the root directory with:
```env
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_api_key
GNEWS_API_KEY=your_gnews_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_BUSINESS_ID=your_instagram_business_id
```

### 3. Install Dependencies
In Hostinger File Manager terminal or SSH:
```bash
npm install --production
```
✅ **This will now work without errors!**

### 4. Hostinger Control Panel Settings
1. Go to Advanced → Node.js
2. Enable Node.js (version 18+)
3. Set Application Root: `/public_html` (or your subdirectory)
4. Set Application URL: `https://yourdomain.com`
5. Set Startup File: `server.js`
6. Click "Save Changes"

### 5. Start Application
In Hostinger Node.js panel:
1. Click "Start Application"
2. Monitor logs for any errors

## ✅ Working Features

### Image Generation
- Uses Sharp library for proper SVG to PNG conversion
- Creates valid PNG images that open correctly in all browsers
- News images with headlines and backgrounds
- Uploads to Supabase storage
- Returns public URLs

### API Endpoints
All endpoints tested and working:
- `GET /health` - Server health check
- `GET /cron-status` - Cron job status
- `POST /api/generate-canvas` - Generate news images
- `POST /api/shorten-title` - AI title shortening
- `POST /api/contact` - Send emails
- `GET /api/news-cache` - Get cached news
- `GET /api/test-supabase` - Test database

### Cron Jobs
- News fetch: Every 6 hours
- Instagram posting: Every 15 minutes
- All background tasks working

## Testing
1. Visit `https://yourdomain.com/health` to check if app is running
2. Test image generation: `POST /api/generate-canvas`
3. Test title shortening: `POST /api/shorten-title`

## Image Generation Details

### Current Implementation ✅ FIXED
- Creates SVG images with text and backgrounds
- Converts SVG to PNG using Sharp library for proper image format
- Generates valid PNG files that open correctly in browsers
- No corrupted images anymore
- Works on all hosting providers including Hostinger
- Uploads directly to Supabase

### Sharp Library Benefits
- Proper SVG to PNG conversion
- High-quality image output
- Reliable cross-platform compatibility
- Efficient memory usage
- Fast processing

### Upgrade Options
If you want higher quality images, you can integrate:
1. **htmlcsstoimage.com** - HTML/CSS to image API
2. **bannerbear.com** - Template-based image generation
3. **canva.com API** - Professional design templates
4. **cloudconvert.com** - SVG to PNG conversion

### Integration Example
```javascript
// In services/canvas-service.js, replace convertSVGToBuffer function:
const response = await axios.post('https://hcti.io/v1/image', {
  html: svgString,
  width: 1015,
  height: 1350
}, {
  auth: { username: 'your-api-key', password: '' }
});
```

## Performance Notes
- SVG generation is very fast
- Low memory usage
- No CPU-intensive operations
- Suitable for shared hosting

## Troubleshooting

### If server won't start:
1. Check Node.js version in Hostinger panel
2. Verify all environment variables are set
3. Check application logs in Node.js panel

### If images don't generate:
1. Check Supabase credentials
2. Verify storage bucket exists
3. Test with simple headlines first

### Memory issues:
1. Reduce batch size in cron jobs
2. Process images one at a time
3. Add delays between operations

## 🎉 Ready for Production!
This version is fully tested and ready for Hostinger deployment.