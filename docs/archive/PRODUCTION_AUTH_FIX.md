# Production Authentication Fix

## Root Cause

Authentication works on **localhost** but NOT on **testmanship.com** because of environment variable configuration.

---

## Fix Steps

### 1. Check Your Production Domain

First, determine your exact production URL:
- Is it `https://testmanship.com` or `https://www.testmanship.com`?
- Check which one actually loads your site

### 2. Set Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Set these EXACTLY:**

```bash
NEXTAUTH_URL=https://testmanship.com
# OR
NEXTAUTH_URL=https://www.testmanship.com
# (Use whichever one is your actual domain)

NEXTAUTH_SECRET=<generate-a-new-secret-here>
# Generate with: openssl rand -base64 32

GOOGLE_CLIENT_ID=221057021972-g2216rqi11p29jjen6loln152q8knmu3.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=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
```

**Important:** Make sure these are set for **Production** environment in Vercel!

### 3. Update Google OAuth Console

Go to: https://console.cloud.google.com/apis/credentials

Find your OAuth 2.0 Client ID and **add these to "Authorized redirect URIs":**

```
https://testmanship.com/api/auth/callback/google
https://www.testmanship.com/api/auth/callback/google
```

**AND add these to "Authorized JavaScript origins":**

```
https://testmanship.com
https://www.testmanship.com
```

**Why both?** Because users might access via `www` or non-`www`, and both need to work.

### 4. Check for www Redirect Issues

**Problem:** If your site redirects from `www.testmanship.com` → `testmanship.com` (or vice versa), NextAuth might get confused.

**Solution:** In Vercel, go to:
- Settings → Domains
- Check if both domains are listed
- Make sure one is set as primary
- Ensure `NEXTAUTH_URL` matches the PRIMARY domain

### 5. Common Mistakes

❌ **Wrong:**
```bash
NEXTAUTH_URL=http://testmanship.com  # Missing 'https://'
NEXTAUTH_URL=testmanship.com         # Missing protocol
NEXTAUTH_URL=https://testmanship.com/ # Trailing slash (remove it)
```

✅ **Correct:**
```bash
NEXTAUTH_URL=https://testmanship.com
```

### 6. After Setting Variables

1. **Redeploy** your Vercel app (Settings → Deployments → Redeploy)
2. OR wait for auto-deployment from GitHub push
3. Test authentication on production

### 7. Quick Debug

Visit this URL on production to check env vars are set:
```
https://testmanship.com/api/auth-check
```

You should see:
```json
{
  "checks": {
    "NEXTAUTH_URL": { "exists": true, "actual": "https://testmanship.com" },
    "NEXTAUTH_SECRET": { "exists": true },
    "GOOGLE_CLIENT_ID": { "exists": true },
    "GOOGLE_CLIENT_SECRET": { "exists": true }
  },
  "allConfigured": true
}
```

If any show `"exists": false`, that variable is not set in Vercel!

---

## The Redirect Loop Explained

**What's happening:**

1. User clicks "Start Learning" on testmanship.com
2. NextAuth tries to sign in with Google
3. Google OAuth redirects back to: `https://testmanship.com/api/auth/callback/google`
4. **BUT** Google doesn't recognize this URL because it's not in "Authorized redirect URIs"
5. OR `NEXTAUTH_URL` is wrong, so NextAuth gets confused
6. Session doesn't get created properly
7. Middleware sees no valid session → redirects to `/`
8. Homepage sees stale/invalid session → redirects to `/dashboard`
9. **LOOP!**

**Fix:** Make sure `NEXTAUTH_URL` matches your production domain EXACTLY, and that domain is authorized in Google OAuth Console.

---

## Checklist

- [ ] Identify your primary domain (www or non-www)
- [ ] Set `NEXTAUTH_URL` in Vercel to match primary domain
- [ ] Generate and set `NEXTAUTH_SECRET` in Vercel
- [ ] Set `GOOGLE_CLIENT_ID` in Vercel
- [ ] Set `GOOGLE_CLIENT_SECRET` in Vercel
- [ ] Add both www and non-www redirect URIs to Google Console
- [ ] Add both www and non-www origins to Google Console
- [ ] Redeploy from Vercel
- [ ] Test `/api/auth-check` endpoint
- [ ] Test sign-in flow on production

---

## Still Not Working?

If it still fails after all this, check browser console for:
- CORS errors
- 401/403 errors from Google
- Redirect URI mismatch errors

And check Vercel deployment logs for:
- NextAuth errors
- Missing environment variables warnings
