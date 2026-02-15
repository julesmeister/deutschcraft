# Getting Started Guide

Quick start guide for developers, teachers, and students using DeutschCraft Web V2.

---

## For Developers

### Prerequisites
- Node.js 18+ and npm
- Firebase account (free tier works)
- Turso account (free tier works)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/your-org/deutschcraft.git
cd deutschcraft
npm install
```

### 2. Environment Setup

Create `.env.local` in the project root:

```bash
# Turso Database
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Google OAuth (for authentication)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

**Where to get these values:**
- Turso: See [Database Setup Guide](./DATABASE_SETUP.md#turso-setup)
- Firebase: See [Database Setup Guide](./DATABASE_SETUP.md#firestore-setup)
- Google OAuth: See [Google Auth Setup](#google-oauth-setup) below

### 3. Database Migrations

```bash
# Run Turso migrations
npm run turso:migrate

# Verify tables created
npm run turso:verify
```

### 4. Run Development Server

```bash
npm run dev
# Opens at http://localhost:3001
```

### 5. Test Login

1. Navigate to http://localhost:3001
2. Click "Sign In with Google"
3. Authorize with your Google account
4. You should be redirected to dashboard

**First user is automatically a teacher.** Subsequent users are students by default.

---

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create new project)
3. Navigate to: **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: "DeutschCraft Web V2"

### 2. Configure Authorized Domains

**Authorized JavaScript origins:**
```
http://localhost:3001
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:3001
https://your-production-domain.com
```

### 3. Copy Client ID

Copy the **Client ID** (ends with `.apps.googleusercontent.com`) and add to `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
```

### 4. Enable Google Sign-In in Firebase

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Save

---

## For Teachers

### Adding Students to Your Class

#### Method 1: Share Sign-Up Link (Recommended)

1. Log in to your teacher dashboard
2. Navigate to **Students** tab
3. Click **Copy Sign-Up Link**
4. Share link with your students (email, chat, etc.)

Students who sign up via this link are automatically added to your class.

#### Method 2: Manual Addition

1. Student creates account independently
2. You navigate to **Students** → **Add Student**
3. Enter student's email address
4. Click **Add to Class**

### Creating Batches (Class Groups)

1. Dashboard → **Batches** → **Create New Batch**
2. Enter details:
   - **Name**: "Batch A1 - Spring 2024"
   - **Description**: "Beginner German class"
   - **Start Date**: 2024-03-01
   - **Current Level**: A1
3. Click **Create Batch**

### Assigning Students to Batches

1. Go to **Students** tab
2. Select students (checkboxes)
3. Click **Assign to Batch** → Select batch
4. Click **Confirm**

### Assigning Writing Exercises

1. Dashboard → **Writing Exercises** → **Create Assignment**
2. Fill in:
   - **Title**: "Describe your daily routine"
   - **Instructions**: "Write 150-200 words about your typical day"
   - **Level**: A2
   - **Due Date**: 2024-03-15
3. Select **Assigned To**:
   - All students
   - Specific batch
   - Individual students
4. Click **Assign**

### Reviewing Writing Submissions

1. Dashboard → **Writing Submissions**
2. Click on student's submission
3. Provide feedback:
   - Overall comment
   - Grammar corrections
   - Vocabulary suggestions
4. Mark as **Reviewed**

---

## For Students

### Getting Started

1. **Sign up**: Use the link provided by your teacher
2. **Complete profile**:
   - First name, last name
   - Current German level (if known)
3. **Explore dashboard**:
   - Flashcards
   - Writing exercises
   - Grammar practice

### Using Flashcards

#### Starting a Practice Session

1. Dashboard → **Flashcards**
2. Select your level (A1, A2, B1, etc.)
3. Choose a category (e.g., "Basic Verbs", "Food & Drinks")
4. Click **Start Practice**

#### During Practice

**Card shows German word:**
- Click card or press **Space** to flip

**Card shows English translation:**
- Rate your recall:
  - Press **1** (or click ❌ **Again**): Forgot completely
  - Press **2** (or click 🤔 **Hard**): Difficult to recall
  - Press **3** (or click ✅ **Good**): Recalled correctly
  - Press **4** (or click 😊 **Easy**): Instantly recalled
  - Press **5** (or click 🌟 **Expert**): Too easy

**Navigation:**
- **←** Previous card
- **→** Next card (only if already reviewed)

#### Review Mode

Want to see all cards in a category (not just due cards)?

1. Select category
2. Click **Review All** button (top right)
3. Browse all cards without affecting SRS schedule

### Submitting Writing Exercises

1. Dashboard → **Writing Exercises**
2. Find your assigned task
3. Click **Start Writing**
4. Write your text in the editor
5. Click **Submit** when done

**Tips:**
- Save drafts frequently (auto-save every 30 seconds)
- Use the word counter to meet requirements
- Check grammar before submitting
- You can edit until the due date

### Tracking Progress

#### Weekly Progress Chart

Dashboard → **Flashcards** → View weekly chart:
- Cards reviewed per day
- Current streak (consecutive days)
- Total words learned

#### Mastery Levels

Each flashcard has a mastery level (0-10):
- 0-2: Learning
- 3-5: Familiar
- 6-8: Mastered
- 9-10: Expert

Aim to get all cards to level 5+ for solid retention.

---

## Common Setup Issues

### "Firebase config not found"

**Problem**: Environment variables not loaded

**Fix:**
```bash
# Verify .env.local exists
ls -la .env.local

# Restart dev server
npm run dev
```

### "Failed to connect to Turso"

**Problem**: Invalid Turso credentials

**Fix:**
```bash
# Verify credentials
turso db show deutschcraft --url
turso db tokens create deutschcraft

# Update .env.local with new values
```

### "Google Sign-In not working"

**Problem**: OAuth client ID mismatch or unauthorized domain

**Fix:**
1. Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`
2. Verify authorized domains in Google Cloud Console
3. Ensure `http://localhost:3001` is in authorized origins

### "No categories showing in flashcards"

**Problem**: Missing vocabulary data or index files

**Fix:**
```bash
# Rebuild index files
npm run flashcards:rebuild-index

# Verify flashcard data exists
ls lib/data/vocabulary/split/a1/
```

### "Writing exercises not loading"

**Problem**: Firestore permissions or missing collection

**Fix:**
1. Check Firestore security rules (see [Database Setup](./DATABASE_SETUP.md))
2. Verify collections exist: `users`, `students`, `teachers`
3. Check browser console for permission errors

---

## Development Tools

### Useful npm Scripts

```bash
npm run dev               # Start dev server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run turso:migrate     # Run database migrations
npm run turso:verify      # Verify database schema
npm run flashcards:rebuild-index  # Rebuild flashcard indexes
```

### Database Management

**Turso Shell:**
```bash
turso db shell deutschcraft

# Useful queries
SELECT COUNT(*) FROM flashcard_progress;
SELECT * FROM flashcard_progress WHERE user_id = 'user@example.com' LIMIT 10;
```

**Firestore Console:**
https://console.firebase.google.com/ → Your Project → Firestore Database

### React Query DevTools

Already included in development mode. Open browser DevTools → React Query tab to:
- Inspect cache state
- Force refetch queries
- View query timings

---

## Production Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Import your Git repository

2. **Set Environment Variables**:
   - All variables from `.env.local`
   - Settings → Environment Variables → Add

3. **Deploy**:
   - Push to `main` branch → Auto-deploy
   - Or click **Deploy** in Vercel dashboard

4. **Update OAuth Redirect URIs**:
   - Google Cloud Console → Add production domain
   - Example: `https://testmanship.vercel.app`

### Environment Variables for Production

**Required:**
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_FIREBASE_*` (all Firebase config)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**Optional:**
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` (for analytics)
- `NODE_ENV=production` (auto-set by Vercel)

---

## Next Steps

After completing this guide:

1. **Developers**: Read [Architecture Guide](../technical/ARCHITECTURE.md)
2. **Learn about flashcards**: Read [Flashcards System Guide](./FLASHCARDS_SYSTEM.md)
3. **Database deep dive**: Read [Database Setup Guide](./DATABASE_SETUP.md)
4. **Performance optimizations**: Read [Optimization History](../technical/OPTIMIZATION_HISTORY.md)

---

## Getting Help

- **Documentation**: Check `docs/` folder
- **Issues**: Check GitHub Issues
- **Code examples**: See files in `components/` and `lib/hooks/`
- **Database queries**: See `lib/services/turso/` and `lib/services/firebase/`
