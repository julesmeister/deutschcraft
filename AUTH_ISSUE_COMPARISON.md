# Authentication Issue - Before vs After Comparison

## Summary

The authentication was working fine **before** the debugging session. The main changes that broke it:

1. **HeroSection.tsx** - Changed from simple Link to complex authentication logic
2. **lib/auth.ts** - Added NEXTAUTH_SECRET, verbose logging, authorization params
3. **app/dashboard/page.tsx** - Changed from `router.push()` to `window.location.href`
4. **next.config.ts** - Modified console log removal settings

---

## File 1: components/sections/HeroSection.tsx

### ✅ BEFORE (Working - Commit 6f8bda8)

**Simple approach:** Just a Link component to `/signup`

```tsx
<Link
  href="/signup"
  className="theme-btn theme-btn-light group inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-[15px] py-2 pl-8 pr-2 rounded-md"
>
  <span className="btn-text relative z-10 transition-colors duration-300">Start Learning</span>
  {/* Icon SVG */}
</Link>
```

**Key points:**
- No authentication logic in HeroSection
- Simple Link component
- No useSession, no useRouter
- Just navigates to /signup page

---

### ❌ AFTER (Broken - Current)

**Complex approach:** Full authentication flow with session validation

```tsx
'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function HeroSection() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // DISABLED: Auto-redirect that caused infinite loop
  // useEffect(() => {
  //   if (session && !isExpired) {
  //     window.location.href = '/dashboard';
  //   }
  // }, [session, status]);

  const handleStartLearning = async () => {
    console.info('🔵 START LEARNING CLICKED');

    if (status === 'loading') return;

    if (session) {
      // Validate session expiry
      const expiryDate = new Date(session.expires);
      const now = new Date();
      const isExpired = expiryDate < now;

      if (isExpired) {
        await signIn('google', {
          callbackUrl: window.location.origin + '/dashboard',
          redirect: true
        });
        return;
      }

      // Navigate to dashboard
      window.location.href = '/dashboard';
    } else {
      await signIn('google', {
        callbackUrl: window.location.origin + '/dashboard',
        redirect: true
      });
    }
  };

  return (
    <button onClick={handleStartLearning} disabled={status === 'loading'}>
      {status === 'loading' ? 'Loading...' : session ? 'Go to Dashboard' : 'Start Learning'}
    </button>
  );
}
```

**Problems introduced:**
- Complex authentication logic that may conflict with middleware
- Session expiry validation (might be checking incorrectly)
- Auto-redirect useEffect that caused infinite loops
- Changed from Link to button with complex onClick handler
- Uses window.location.href instead of Next.js router

---

## File 2: lib/auth.ts

### ✅ BEFORE (Working)

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;
        await updateUserPhoto(user.email, user.image || null);
        return true;
      } catch (error) {
        console.error('[Auth] Error in signIn callback:', error);
        return true;
      }
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};
```

**Key points:**
- NO `secret` field (relied on NEXTAUTH_SECRET env var automatically)
- NO `authorization` params on GoogleProvider
- NO `redirect` callback
- NO `debug` mode
- Simple, minimal configuration

---

### ❌ AFTER (Current)

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,  // ← ADDED
  callbacks: {
    async signIn({ user, account, profile }) {
      // Same logic but with verbose logging removed
    },
    async session({ session, token }) {
      return session;
    },
    async redirect({ url, baseUrl }) {  // ← ADDED
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',  // ← ADDED
  pages: {
    signIn: '/',
  },
};
```

**Changes that might have broken it:**
- Added explicit `secret` field (might conflict with env var)
- Added `authorization.params` to GoogleProvider (forces re-consent)
- Added `redirect` callback (might be interfering with navigation)
- Added `debug` mode

---

## File 3: app/dashboard/page.tsx

### ✅ BEFORE (Working)

```typescript
export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isLoading: isLoadingUser } = useCurrentUser(session?.user?.email || null);

  useEffect(() => {
    if (status === 'loading' || isLoadingUser) return;

    if (!session) {
      router.push('/');  // ← Using router.push
      return;
    }

    if (user?.role === 'TEACHER') {
      router.push('/dashboard/teacher');  // ← Using router.push
    } else {
      router.push('/dashboard/student');  // ← Using router.push
    }
  }, [session, status, router, user, isLoadingUser]);

  return <CatLoader fullScreen message="Loading dashboard..." />;
}
```

**Key points:**
- Used `router.push()` for all navigation
- Checked `status === 'loading' || isLoadingUser` in single condition
- No verbose logging
- Clean, simple logic

---

### ❌ AFTER (Current)

```typescript
export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isLoading: isLoadingUser } = useCurrentUser(session?.user?.email || null);

  useEffect(() => {
    if (status === 'loading') return;
    if (isLoadingUser) return;

    if (!session) {
      window.location.href = '/';  // ← Changed to window.location
      return;
    }

    if (user?.role === 'TEACHER') {
      window.location.href = '/dashboard/teacher';  // ← Changed to window.location
    } else {
      window.location.href = '/dashboard/student';  // ← Changed to window.location
    }
  }, [session, status, user, isLoadingUser]);  // ← Removed 'router' from deps

  return <CatLoader fullScreen message="Loading dashboard..." />;
}
```

**Problems:**
- Changed from `router.push()` to `window.location.href` (causes full page reload)
- Split the loading checks into separate early returns
- Removed `router` from dependency array (might cause stale closure issues)
- Added verbose logging (removed in latest version but still different)

---

## File 4: next.config.ts

### ✅ BEFORE (Working)

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
},
```

**Effect:** Removed ALL console logs in production

---

### ❌ AFTER (Current)

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn', 'info'],
  } : false,
},
```

**Effect:** Only removes console.log, keeps error/warn/info

**This change shouldn't break auth**, but it was part of the debugging session.

---

## Root Cause Analysis

### The Likely Culprit: Redirect Loop

1. **Homepage (HeroSection)** has auto-redirect:
   - Sees valid session → redirects to `/dashboard`

2. **Dashboard page** has session check:
   - Checks session → if invalid, redirects to `/`

3. **The Problem:**
   - Dashboard might be checking session BEFORE it's fully loaded
   - OR session validation is failing for some reason
   - This creates an infinite loop: `/` → `/dashboard` → `/` → `/dashboard`

### Why It Worked Before

The old version:
- HeroSection had NO auto-redirect (just a Link to /signup)
- User had to manually click to navigate
- Dashboard used `router.push()` which is client-side (faster)
- No complex session expiry validation

---

## Recommended Fix

### Option 1: Revert to Working State

```bash
git checkout 6f8bda8 -- components/sections/HeroSection.tsx
git checkout 6f8bda8 -- lib/auth.ts
git checkout 6f8bda8 -- app/dashboard/page.tsx
```

### Option 2: Keep Improvements, Fix Issues

1. **HeroSection.tsx:**
   - Remove auto-redirect useEffect completely
   - Keep the button with signIn logic
   - But use `router.push()` instead of `window.location.href`

2. **lib/auth.ts:**
   - Remove explicit `secret` field (rely on env var)
   - Remove `authorization.params` (don't force re-consent)
   - Remove `redirect` callback (let NextAuth handle it)

3. **app/dashboard/page.tsx:**
   - Change back to `router.push()` instead of `window.location.href`
   - Add `router` back to dependency array

### Option 3: Debug Further

Check the actual logs when navigating to `/dashboard` to see:
- Is the session actually valid?
- Is `isLoadingUser` stuck on true?
- Is there a race condition in the useEffect?

---

## Next Steps

1. **Immediate:** Stop the infinite redirect loop by disabling auto-redirect
2. **Test:** Manually click "Go to Dashboard" and check console logs
3. **Decide:** Revert to working version OR fix the new implementation
4. **Long-term:** Consider using Next.js middleware for authentication instead of client-side checks
