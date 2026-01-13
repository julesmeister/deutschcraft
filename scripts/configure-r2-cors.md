# Fix Audio Playback Error - Configure R2 CORS

## The Error
```
Runtime NotSupportedError
The media resource indicated by the src attribute or assigned media provider object was not suitable.
```

This happens because:
1. R2 bucket needs **public access enabled**
2. R2 bucket needs **CORS configuration** to allow audio playback from your domain

---

## Solution: Configure Cloudflare R2

### Step 1: Enable Public Access

1. Go to **Cloudflare Dashboard** → **R2**
2. Click on your **testmanship** bucket
3. Click **Settings** tab
4. Find **Public Access** section
5. Click **Allow Access**
6. You'll get a public URL like: `https://pub-[hash].r2.dev`

**Note:** Your public URL is already in `.env.local` as:
```
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-1a83c88d8078f4045e93a290e0579812.r2.dev
```

### Step 2: Configure CORS

**Option A: Using Cloudflare Dashboard (Easier)**

1. In your **testmanship** bucket settings
2. Scroll to **CORS Policy** section
3. Click **Add CORS Policy**
4. Add this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com",
      "https://*.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "Content-Length",
      "Content-Type",
      "Content-Range"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**Replace:**
- `https://yourdomain.com` with your actual production domain
- Keep `http://localhost:3000` for local development
- Keep `https://*.vercel.app` if deploying to Vercel

5. Click **Save**

---

**Option B: Using Wrangler CLI (Advanced)**

1. Install Wrangler (if not installed):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create a `cors-config.json` file:
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Apply CORS configuration:
```bash
wrangler r2 bucket cors put testmanship --cors-file cors-config.json
```

---

## Step 3: Test Audio Playback

1. Restart your dev server:
```bash
npm run dev
```

2. Go to **Resources → Materials**
3. Click on **🎵 Audio Files** tab
4. Click the **▶️ Play** button on any audio file
5. Audio should now play successfully!

---

## Troubleshooting

### Audio still not playing?

**Check 1: Public URL is correct**
```bash
# Try accessing an audio file directly in browser
https://pub-1a83c88d8078f4045e93a290e0579812.r2.dev/materials/[path-to-file].mp3
```

**Check 2: CORS is properly configured**
```bash
# Check CORS policy
wrangler r2 bucket cors get testmanship
```

**Check 3: Browser Console**
- Open browser DevTools (F12)
- Go to **Console** tab
- Look for CORS errors
- If you see "CORS policy blocked", CORS is not properly configured

**Check 4: Network Tab**
- Open browser DevTools (F12)
- Go to **Network** tab
- Click play on an audio file
- Check the MP3 request:
  - Status should be **200 OK**
  - Response headers should include `Access-Control-Allow-Origin`

---

## Security Notes

- ✅ CORS only allows GET/HEAD requests (read-only)
- ✅ Audio files are public but not directly discoverable
- ✅ Play counts are tracked in your database
- ⚠️ Anyone with the direct URL can access the files

If you want more security:
- Use signed URLs (temporary access)
- Implement API route to proxy audio files
- Add authentication check before serving audio

---

## Custom Domain (Optional)

For a cleaner URL like `audio.testmanship.com`:

1. Go to **R2** → **testmanship** bucket → **Settings**
2. Click **Connect Custom Domain**
3. Enter: `audio.testmanship.com`
4. Follow DNS configuration instructions
5. Update `.env.local`:
```
NEXT_PUBLIC_R2_PUBLIC_URL=https://audio.testmanship.com
```

---

## Summary

✅ Enable public access on R2 bucket
✅ Configure CORS to allow your domain
✅ Test audio playback in browser
✅ Audio files now sorted by track number
✅ Beautiful new audio player UI

**Your audio library is ready!** 🎵
