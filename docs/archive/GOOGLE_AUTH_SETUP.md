# Google Authentication Setup

Google authentication has been implemented using NextAuth.js with the same Firebase project as the Android app.

## Configuration Required

### 1. Google Cloud Console Setup

You need to add the web app to your existing Google Cloud project:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `testmanship-ac721`
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3002`
   - Your production domain (e.g., `https://testmanship.vercel.app`)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3002/api/auth/callback/google`
   - Your production domain + `/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret**

### 2. Update .env.local

Replace the placeholder in `.env.local`:

```env
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
```

Also update `NEXTAUTH_SECRET` with a random string:

```bash
# Generate a secret
openssl rand -base64 32
```

### 3. Firebase Project

The app is already configured to use your existing Firebase project:
- Project ID: `testmanship-ac721`
- API Key: Already configured in `lib/firebase.ts`
- Same Firestore database as Android app

## How It Works

1. User clicks "Start Learning" button in navbar
2. If not signed in: Triggers Google Sign-In popup
3. User authenticates with Google
4. NextAuth creates session
5. User redirected to `/dashboard` (you'll need to create this page)
6. If already signed in: Button shows "Go to Dashboard"

## Files Created/Modified

- `lib/firebase.ts` - Firebase client configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `components/providers/SessionProvider.tsx` - Session wrapper
- `app/layout.tsx` - Wrapped app with SessionProvider
- `components/ui/Navbar.tsx` - Updated to trigger Google auth
- `.env.local` - Environment variables

## Next Steps

1. Get Google OAuth credentials from Cloud Console
2. Update `.env.local` with real credentials
3. Test authentication flow
4. Create `/dashboard` page for authenticated users
5. Sync user data to Firestore (similar to Android app)
6. Add Firestore security rules

## Testing

```bash
npm run dev
```

Visit http://localhost:3002 and click "Start Learning"

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel dashboard
2. Update authorized origins/redirect URIs in Google Cloud Console
3. Update `NEXTAUTH_URL` to production domain
