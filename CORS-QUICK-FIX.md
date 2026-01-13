# ⚡ CORS Quick Fix - 2 Minutes

## Your Exact CORS Configuration

Copy this **EXACT** JSON and paste it into Cloudflare R2:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://testmanship.com",
      "https://www.testmanship.com",
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
      "ETag",
      "Content-Range"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Where to Paste It

### 1. Open Cloudflare
→ Go to: https://dash.cloudflare.com

### 2. Navigate to R2
→ Click **"R2"** in left sidebar

### 3. Open Your Bucket
→ Click **"testmanship"**

### 4. Go to Settings
→ Click **"Settings"** tab at the top

### 5. Enable Public Access
→ Find **"Public Access"** or **"R2.dev subdomain"** section
→ Click **"Allow Access"** or **"Connect R2.dev subdomain"**

### 6. Configure CORS
→ Scroll down to **"CORS policy"** section
→ Click **"Edit CORS policy"** or **"Add CORS policy"**
→ **Paste the JSON above**
→ Click **"Save"**

---

## Test if It Works

### Quick Test in Browser Console

1. Open http://localhost:3000/resources/materials
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Paste this and press Enter:

```javascript
fetch('https://pub-19128c4698614177ab204de2a724784c.r2.dev/materials/test.mp3', {
  method: 'HEAD'
})
.then(() => console.log('✅ CORS is working!'))
.catch(() => console.error('❌ CORS not working yet'));
```

**Result:**
- ✅ "CORS is working!" → You're done!
- ❌ "CORS not working yet" → Double check the steps above

---

## Run Verification Script

```bash
npx tsx scripts/verify-r2-setup.ts
```

This will check:
- ✅ Environment variables are set
- ✅ Public URL is accessible
- ✅ CORS headers are present

---

## Still Not Working?

### Checklist:
- [ ] Did you click **Save** after pasting CORS config?
- [ ] Did you wait 1-2 minutes for changes?
- [ ] Did you **restart your dev server**?
- [ ] Did you **clear browser cache** (Ctrl+Shift+R)?
- [ ] Is public access **enabled** on the bucket?

### Try This:
1. Close all browser tabs
2. Stop dev server (Ctrl+C)
3. Start dev server again: `npm run dev`
4. Open fresh browser tab
5. Try playing audio

---

## Alternative: Test with cURL

```bash
curl -I -H "Origin: http://localhost:3000" https://pub-19128c4698614177ab204de2a724784c.r2.dev/materials/test.mp3
```

**Look for:**
```
access-control-allow-origin: http://localhost:3000
```

If you see it → ✅ CORS is working!

---

## 🎯 Expected Result

Once CORS is configured:
1. Click **▶️ Play** button
2. Audio starts playing
3. See animated wave bars
4. No errors in console

**That's it!** 🎉
