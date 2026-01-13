# 🔧 Complete CORS Setup Guide for Testmanship.com

## The Problem
Audio files won't play because R2 bucket blocks cross-origin requests.

## The Solution
Configure CORS on your Cloudflare R2 bucket to allow requests from your domains.

---

## 📋 Step-by-Step Instructions

### Step 1: Log into Cloudflare Dashboard

1. Go to: **https://dash.cloudflare.com**
2. **Log in** with your Cloudflare account
3. You should see your dashboard

### Step 2: Navigate to R2

1. Look at the **left sidebar**
2. Find and click **R2** (it's under "Storage")
   - If you don't see it, click "Workers & Pages" then look for R2
3. You'll see a list of your R2 buckets

### Step 3: Open Your Bucket

1. Find your bucket named **testmanship**
2. **Click on it** to open the bucket details
3. You'll see tabs at the top: Overview, Settings, Metrics, etc.

### Step 4: Go to Settings Tab

1. Click the **Settings** tab (at the top of the page)
2. Scroll down - you'll see several sections

### Step 5: Enable Public Access

Look for a section called **"Public Access"** or **"R2.dev subdomain"**

1. You'll see text like: *"Your bucket is currently private"*
2. Click the **"Allow Access"** button (or "Connect R2.dev subdomain")
3. A popup may appear asking you to confirm
4. Click **"Allow"** or **"Connect"**
5. ✅ You should now see: *"Public access is enabled"*
6. You'll see a URL like: `https://pub-[random-hash].r2.dev`

**✅ Important:** This URL should match what's in your `.env.local`:
```
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-19128c4698614177ab204de2a724784c.r2.dev
```

### Step 6: Configure CORS Policy

Scroll down to find **"CORS policy"** section

1. You'll see text like: *"Configure cross-origin resource sharing"*
2. Click **"Edit CORS policy"** or **"Add CORS policy"** button
3. A text editor will appear

### Step 7: Paste CORS Configuration

**Copy this EXACT configuration** and paste it:

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

**What this does:**
- `AllowedOrigins`: Allows requests from:
  - `localhost:3000` (your local development)
  - `testmanship.com` (your production site)
  - `www.testmanship.com` (www version)
  - `*.vercel.app` (if you deploy to Vercel)
- `AllowedMethods`: Only GET and HEAD (read-only, secure)
- `AllowedHeaders`: Accept any request headers
- `ExposeHeaders`: Let browser see these response headers
- `MaxAgeSeconds`: Cache CORS response for 1 hour

### Step 8: Save Configuration

1. Click **"Save"** button
2. Wait for confirmation message
3. ✅ CORS is now configured!

---

## 🧪 Testing if CORS Works

### Test 1: Direct Browser Test

1. Open this URL in your browser:
```
https://pub-19128c4698614177ab204de2a724784c.r2.dev/materials/[any-audio-file].mp3
```

2. Replace `[any-audio-file].mp3` with an actual file path from your bucket
3. **Should:** Audio should download/play
4. **If not:** Public access is not enabled

### Test 2: CORS Test (Using Browser Console)

1. Go to your site: **http://localhost:3000/resources/materials**
2. Open browser DevTools: Press **F12**
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
fetch('https://pub-19128c4698614177ab204de2a724784c.r2.dev/materials/Schritte%20International%20Neu%20A1.1/audio%20AB/Schritte_int_Neu_1_AB_CD_1_Track_01.mp3', {
  method: 'HEAD'
})
.then(response => {
  console.log('✅ CORS is working!');
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
})
.catch(error => {
  console.error('❌ CORS error:', error);
});
```

**Expected Result:**
```
✅ CORS is working!
Status: 200
```

**If you see an error:**
```
❌ CORS error: Failed to fetch
```
→ CORS is not properly configured

### Test 3: Network Tab Test

1. Stay on the materials page
2. In DevTools, go to **Network** tab
3. Click the **▶️ Play button** on any audio file
4. Look for the MP3 request in the network list
5. Click on it to see details

**Check Response Headers:**
You should see:
```
access-control-allow-origin: http://localhost:3000
access-control-allow-methods: GET, HEAD
```

**If missing:** CORS not configured correctly

---

## 🔍 Troubleshooting

### Problem 1: "Allow Access" button not visible

**Solution:**
- Look for "Connect R2.dev subdomain" instead
- Or look for "Public URL" section
- Try refreshing the page

### Problem 2: Can't find CORS Policy section

**Solution:**
1. Make sure you're in the **Settings** tab
2. Scroll all the way down
3. It might be called "CORS rules" or "Access control"
4. If still can't find it, check Cloudflare docs: https://developers.cloudflare.com/r2/buckets/cors/

### Problem 3: CORS still not working after configuration

**Checklist:**
- ✅ Did you click **Save** after pasting CORS config?
- ✅ Did you wait 1-2 minutes for changes to propagate?
- ✅ Did you restart your dev server?
- ✅ Did you clear browser cache (Ctrl+Shift+R)?
- ✅ Is the domain spelling correct (no typos)?

### Problem 4: Audio plays on localhost but not on testmanship.com

**Solution:**
- Make sure you added both `https://testmanship.com` AND `https://www.testmanship.com`
- Check if your site uses `http://` (it shouldn't, but just in case)
- Try adding both http and https versions

### Problem 5: JSON syntax error when saving CORS

**Common mistakes:**
- ❌ Missing commas between items
- ❌ Extra comma after last item
- ❌ Missing quotes around strings
- ❌ Not wrapping in `[]` square brackets

**Use this validator:**
1. Copy your CORS JSON
2. Go to: https://jsonlint.com
3. Paste and click "Validate JSON"
4. Fix any errors shown

---

## 🎯 Quick Verification Checklist

After configuration, verify:

- [ ] Can access audio file directly in browser
- [ ] No CORS errors in browser console
- [ ] Network tab shows `access-control-allow-origin` header
- [ ] Audio plays when clicking play button on localhost:3000
- [ ] (If deployed) Audio plays on testmanship.com

---

## 📞 Still Having Issues?

### Option 1: Check Cloudflare Status
- Go to: https://www.cloudflarestatus.com
- Make sure R2 is operational

### Option 2: Verify Bucket Name
Run this script to check your setup:

```bash
cd C:\Users\User\Documents\testmanship-web-v2
npx tsx scripts/verify-r2-setup.ts
```

### Option 3: Alternative CORS Config (More Permissive)

If the above doesn't work, try this more permissive config:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

**⚠️ Warning:** This allows ALL origins. Use only for testing, then restrict to your domains.

---

## ✅ Success!

Once working, you should be able to:
- 🎵 Click play button on any audio file
- 🎵 Hear the audio playing
- 🎵 See the wave animation
- 🎵 Pause and resume playback

**Your audio library is live!** 🎉

---

## 🔐 Security Notes

The CORS configuration we set:
- ✅ Only allows GET/HEAD (read-only)
- ✅ Only allows specific domains
- ✅ Doesn't allow uploads or deletions
- ✅ Doesn't allow data modification

Your audio files are:
- ✅ Publicly accessible (by design)
- ✅ Not directly discoverable (need exact URL)
- ✅ Tracked in your database (play counts)
- ✅ Served from Cloudflare's fast CDN

If you want MORE security:
- Use signed URLs (temporary access tokens)
- Proxy audio through your API routes
- Add authentication before serving audio
