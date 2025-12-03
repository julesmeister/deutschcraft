# Social Media Feature - Quick Start Guide

## 🚀 Setup (One Time)

```bash
# 1. Run database migrations
npx tsx turso/migrate.ts

# Expected output:
# ✓ Migrations table ready
# ⏳ Running 7 pending migrations...
# ✓ Completed: 014_create_social_posts_table.sql
# ... (all 7 migrations)
# ✅ All migrations completed successfully!
```

## 📦 Import

```typescript
import {
  // Posts
  createPost, getPost, getPosts, updatePost, deletePost,

  // Media
  uploadMedia, getPostMedia, getPostMediaUrls,

  // Comments
  createComment, getComments,

  // Suggestions
  createSuggestion, getSuggestions, acceptSuggestion,

  // Likes
  toggleLike, hasUserLiked,

  // Utils
  validateFile, base64ToDataUrl,
} from '@/lib/services/turso';
```

## 💬 Create a Post

```typescript
const postId = await createPost({
  userId: session.user.email,
  userEmail: session.user.email,
  content: 'Heute ist ein schöner Tag!',
  cefrLevel: 'A2',
  visibility: 'public',
  mediaType: 'none',
  likesCount: 0,
  commentsCount: 0,
  suggestionsCount: 0,
  sharesCount: 0,
  isEdited: false,
  hasAcceptedSuggestion: false,
});
```

## 📷 Upload Image

```typescript
async function handleImageUpload(file: File, postId: string, userId: string) {
  // 1. Validate
  const validation = validateFile(file, 'image');
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // 2. Upload (auto-compresses!)
  const mediaId = await uploadMedia(postId, userId, file, {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    imageQuality: 0.8,
    maxImageDimension: 1920,
  });

  return mediaId;
}
```

## 📺 Upload Video

```typescript
async function handleVideoUpload(file: File, postId: string, userId: string) {
  // 1. Validate
  const validation = validateFile(file, 'video');
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // 2. Upload (auto-generates thumbnail!)
  const mediaId = await uploadMedia(postId, userId, file, {
    maxVideoSize: 50 * 1024 * 1024, // 50MB
  });

  return mediaId;
}
```

## 🎨 Display Post with Images

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getPosts, getPostMediaUrls, base64ToDataUrl } from '@/lib/services/turso';

export default function PostFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts() {
      // 1. Get posts
      const fetchedPosts = await getPosts({}, 20, 0);

      // 2. Load media URLs for posts with media
      const postsWithMedia = await Promise.all(
        fetchedPosts.map(async (post) => {
          if (post.mediaType !== 'none') {
            const mediaUrls = await getPostMediaUrls(post.postId);
            return { ...post, mediaUrls };
          }
          return post;
        })
      );

      setPosts(postsWithMedia);
    }

    loadPosts();
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.postId} className="border rounded-lg p-4">
          <p>{post.content}</p>
          {post.mediaUrls?.map((url, i) => (
            <img key={i} src={url} alt="Post media" className="mt-2 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

## 💬 Add Comment

```typescript
const commentId = await createComment({
  postId: 'post_123',
  userId: session.user.email,
  content: 'Toller Beitrag!',
  parentCommentId: null, // null for top-level, commentId for reply
  likesCount: 0,
});
```

## ✏️ Create Grammar Suggestion

```typescript
const suggestionId = await createSuggestion({
  postId: 'post_123',
  suggestedBy: session.user.email,
  suggestedTo: postAuthorEmail,
  originalText: 'Ich bin gegangen zu Schule',
  suggestedText: 'Ich bin zur Schule gegangen',
  explanation: '"zu" + "der" = "zur"',
  grammarRule: 'Präpositionen mit Artikel',
  position: { start: 10, end: 30 },
  type: 'grammar',
  severity: 'important',
  status: 'pending',
  upvotes: 0,
  downvotes: 0,
});
```

## ❤️ Like a Post

```typescript
// Toggle like (returns true if liked, false if unliked)
const isLiked = await toggleLike(session.user.email, postId, 'post');

// Check if already liked
const hasLiked = await hasUserLiked(session.user.email, postId);
```

## 📊 Get User Stats

```typescript
const stats = await getUserSocialStats(session.user.email);
console.log(stats);
// {
//   postsCount: 45,
//   suggestionsGiven: 23,
//   suggestionsReceived: 12,
//   acceptanceRate: 78.5
// }
```

## 🔍 Filter Posts

```typescript
// By CEFR level
const a2Posts = await getPosts({ cefrLevel: 'A2' }, 20, 0);

// By user
const myPosts = await getPosts({ userId: session.user.email }, 20, 0);

// By visibility
const publicPosts = await getPosts({ visibility: 'public' }, 20, 0);

// Pagination (offset)
const nextPage = await getPosts({}, 20, 20); // Skip first 20
```

## 🧹 Delete Post

```typescript
// Deletes post AND all associated media, comments, suggestions, etc.
await deletePost(postId);
```

## 💾 Check Storage Usage

```typescript
// Get total storage in bytes
const bytesUsed = await getUserStorageUsage(session.user.email);
const mbUsed = (bytesUsed / 1024 / 1024).toFixed(2);
console.log(`Storage used: ${mbUsed} MB`);

// Get detailed stats
const stats = await getStorageStats(session.user.email);
console.log(stats);
// {
//   totalSize: 15728640,
//   imageCount: 12,
//   videoCount: 2,
//   imageSize: 8388608,
//   videoSize: 7340032
// }
```

## 🎯 Complete Post Creation Form

```tsx
'use client';

import { useState } from 'react';
import { createPost, uploadMedia, validateFile } from '@/lib/services/turso';

export function CreatePostForm({ userId }: { userId: string }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate file if present
      if (file) {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        const validation = validateFile(file, type);
        if (!validation.valid) {
          alert(validation.error);
          setLoading(false);
          return;
        }
      }

      // Create post
      const postId = await createPost({
        userId,
        userEmail: userId,
        content,
        cefrLevel: 'A2',
        mediaType: file ? (file.type.startsWith('image/') ? 'image' : 'video') : 'none',
        visibility: 'public',
        likesCount: 0,
        commentsCount: 0,
        suggestionsCount: 0,
        sharesCount: 0,
        isEdited: false,
        hasAcceptedSuggestion: false,
      });

      // Upload media if present
      if (file) {
        await uploadMedia(postId, userId, file);
      }

      // Reset form
      setContent('');
      setFile(null);
      alert('Post created!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Was möchtest du auf Deutsch schreiben?"
        className="w-full p-3 border rounded-lg"
        rows={4}
        required
      />

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.files?.[0] || null)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

## ⚡ File Limits

| Type | Max Size | Processing |
|------|----------|------------|
| Image | 5MB | Auto-compress to 80% quality, max 1920px |
| Video | 50MB | Auto-generate thumbnail |

**Supported Formats:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM, OGG

## 🔧 Configuration

Default upload options (can override):

```typescript
await uploadMedia(postId, userId, file, {
  maxImageSize: 5 * 1024 * 1024,    // 5MB
  maxVideoSize: 50 * 1024 * 1024,   // 50MB
  imageQuality: 0.8,                 // 80%
  maxImageDimension: 1920,           // 1920px
});
```

## 📚 More Info

- **Full Documentation:** `docs/SOCIAL_MEDIA_TURSO.md`
- **Usage Examples:** `lib/services/turso/SOCIAL_MEDIA_USAGE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

## 🐛 Troubleshooting

**Images not showing?**
- Check console for errors
- Verify media was uploaded: `await getPostMedia(postId)`

**"File too large" error?**
- Default: 5MB images, 50MB videos
- Increase limits in `uploadMedia()` options

**Slow loading?**
- Implement pagination (already built in)
- Lazy load media (only fetch when visible)

## ✅ Checklist

- [ ] Run migrations: `npx tsx turso/migrate.ts`
- [ ] Import services from `@/lib/services/turso`
- [ ] Create post with `createPost()`
- [ ] Upload media with `uploadMedia()`
- [ ] Display with `getPostMediaUrls()`
- [ ] Add comments with `createComment()`
- [ ] Implement likes with `toggleLike()`

**You're ready to build! 🚀**
