# Social Media Feature - Turso Implementation Guide

## Overview

This document explains how to use the Turso-based social media services with built-in file upload capabilities.

**Key Features:**
- ✅ No Firebase Storage needed - all media stored as base64 in Turso SQLite
- ✅ Automatic image compression before upload
- ✅ Video thumbnail generation
- ✅ File size validation and limits
- ✅ CRUD operations for posts, comments, suggestions, likes, shares
- ✅ Complete type safety with TypeScript

## Database Setup

### 1. Run Migrations

```bash
# Make sure your Turso database is set up in .env.local
# TURSO_DATABASE_URL=libsql://your-db.turso.io
# TURSO_AUTH_TOKEN=your-token

# Run migrations (in order)
npx tsx turso/migrate.ts
```

This will create the following tables:
- `social_posts` - User posts with learning context
- `social_media` - Media files (images/videos) as base64
- `social_comments` - Comments with nested replies
- `social_suggestions` - Grammar/vocabulary corrections
- `social_likes` - Like tracking
- `social_shares` - Share tracking
- `social_polls` - Poll support
- `social_poll_votes` - Poll voting

### 2. Import Services

```typescript
// Import social media operations
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  createComment,
  getComments,
  createSuggestion,
  getSuggestions,
  toggleLike,
  hasUserLiked,
  getUserSocialStats,
} from '@/lib/services/turso';

// Import media operations
import {
  uploadMedia,
  getPostMedia,
  getPostMediaUrls,
  deletePostMedia,
  compressImage,
  validateFile,
  getUserStorageUsage,
} from '@/lib/services/turso';
```

## Usage Examples

### Creating a Post

```typescript
// Basic text post
const postId = await createPost({
  userId: 'user@example.com',
  userEmail: 'user@example.com',
  content: 'Heute ist ein schöner Tag!',
  cefrLevel: 'A2',
  visibility: 'public',
  grammarFocus: ['Präsens', 'Adjektive'],
  vocabularyUsed: ['schön', 'Tag'],
  likesCount: 0,
  commentsCount: 0,
  suggestionsCount: 0,
  sharesCount: 0,
  isEdited: false,
  hasAcceptedSuggestion: false,
});

console.log('Created post:', postId);
```

### Uploading Media (Images/Videos)

```typescript
'use client';

import { uploadMedia, validateFile } from '@/lib/services/turso';

async function handleFileUpload(file: File, postId: string, userId: string) {
  // 1. Validate file
  const validation = validateFile(file, file.type.startsWith('image/') ? 'image' : 'video');
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  try {
    // 2. Upload (automatically compresses images)
    const mediaId = await uploadMedia(postId, userId, file, {
      maxImageSize: 5 * 1024 * 1024, // 5MB
      maxVideoSize: 50 * 1024 * 1024, // 50MB
      imageQuality: 0.8, // 80% quality
      maxImageDimension: 1920, // Max 1920px width/height
    });

    console.log('Uploaded media:', mediaId);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Creating a Post with Media

```typescript
async function createPostWithImage(userId: string, content: string, imageFile: File) {
  // 1. Create the post first
  const postId = await createPost({
    userId,
    userEmail: userId,
    content,
    cefrLevel: 'B1',
    mediaType: 'image',
    visibility: 'public',
    likesCount: 0,
    commentsCount: 0,
    suggestionsCount: 0,
    sharesCount: 0,
    isEdited: false,
    hasAcceptedSuggestion: false,
  });

  // 2. Upload the media
  await uploadMedia(postId, userId, imageFile);

  return postId;
}
```

### Fetching Posts with Media

```typescript
import { getPosts, getPostMediaUrls } from '@/lib/services/turso';

async function loadPosts() {
  // 1. Get posts
  const posts = await getPosts({ cefrLevel: 'A2' }, 20, 0);

  // 2. For each post with media, fetch media URLs
  const postsWithMedia = await Promise.all(
    posts.map(async (post) => {
      if (post.mediaType !== 'none') {
        const mediaUrls = await getPostMediaUrls(post.postId);
        return { ...post, mediaUrls };
      }
      return post;
    })
  );

  return postsWithMedia;
}
```

### Displaying Images

```tsx
import { base64ToDataUrl } from '@/lib/services/turso';

function PostImage({ media }: { media: MediaFile }) {
  const dataUrl = base64ToDataUrl(media.data, media.mimeType);

  return (
    <img
      src={dataUrl}
      alt={media.fileName}
      width={media.width}
      height={media.height}
      className="rounded-lg"
    />
  );
}
```

### Adding Comments

```typescript
const commentId = await createComment({
  postId: 'post_123',
  userId: 'commenter@example.com',
  content: 'Toller Beitrag!',
  parentCommentId: null, // null for top-level, or commentId for reply
  likesCount: 0,
});
```

### Creating Suggestions (Grammar Corrections)

```typescript
const suggestionId = await createSuggestion({
  postId: 'post_123',
  suggestedBy: 'teacher@example.com',
  suggestedTo: 'student@example.com',
  originalText: 'Ich bin gegangen zu Schule',
  suggestedText: 'Ich bin zur Schule gegangen',
  explanation: 'In German, "zu" combines with "der" to form "zur"',
  grammarRule: 'Präpositionen mit Artikel',
  position: { start: 10, end: 30 },
  type: 'grammar',
  severity: 'important',
  status: 'pending',
  upvotes: 0,
  downvotes: 0,
});
```

### Liking Posts/Comments

```typescript
// Toggle like (returns true if liked, false if unliked)
const isLiked = await toggleLike('user@example.com', 'post_123', 'post');

// Check if user has liked
const hasLiked = await hasUserLiked('user@example.com', 'post_123');
```

### Getting User Stats

```typescript
const stats = await getUserSocialStats('user@example.com');

console.log(stats);
// {
//   postsCount: 45,
//   suggestionsGiven: 23,
//   suggestionsReceived: 12,
//   acceptanceRate: 78.5
// }
```

### Storage Management

```typescript
import { getUserStorageUsage, getStorageStats } from '@/lib/services/turso';

// Get total storage usage
const totalBytes = await getUserStorageUsage('user@example.com');
console.log(`Storage: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

// Get detailed stats
const stats = await getStorageStats('user@example.com');
console.log(stats);
// {
//   totalSize: 15728640, // bytes
//   imageCount: 12,
//   videoCount: 2,
//   imageSize: 8388608,
//   videoSize: 7340032
// }
```

## Component Example

Here's a complete example of a post creation form:

```tsx
'use client';

import { useState } from 'react';
import { createPost, uploadMedia, validateFile } from '@/lib/services/turso';
import { CEFRLevel } from '@/lib/models/cefr';

export function CreatePostForm({ userId }: { userId: string }) {
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A2');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Validate file if present
      if (file) {
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        const validation = validateFile(file, mediaType);
        if (!validation.valid) {
          alert(validation.error);
          setLoading(false);
          return;
        }
      }

      // 2. Create post
      const postId = await createPost({
        userId,
        userEmail: userId,
        content,
        cefrLevel: level,
        mediaType: file ? (file.type.startsWith('image/') ? 'image' : 'video') : 'none',
        visibility: 'public',
        likesCount: 0,
        commentsCount: 0,
        suggestionsCount: 0,
        sharesCount: 0,
        isEdited: false,
        hasAcceptedSuggestion: false,
      });

      // 3. Upload media if present
      if (file) {
        await uploadMedia(postId, userId, file);
      }

      // 4. Reset form
      setContent('');
      setFile(null);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

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

      <select
        value={level}
        onChange={(e) => setLevel(e.target.value as CEFRLevel)}
        className="w-full p-3 border rounded-lg"
      >
        <option value="A1">A1 - Beginner</option>
        <option value="A2">A2 - Elementary</option>
        <option value="B1">B1 - Intermediate</option>
        <option value="B2">B2 - Upper Intermediate</option>
        <option value="C1">C1 - Advanced</option>
        <option value="C2">C2 - Proficient</option>
      </select>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.files?.[0] || null)}
        className="w-full"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

## File Size Limits

Default limits (configurable in `uploadMedia` options):

- **Images:** 5MB max (automatically compressed)
- **Videos:** 50MB max
- **Image Dimensions:** 1920px max width/height
- **Image Quality:** 80% JPEG compression

## Supported Formats

**Images:**
- JPEG/JPG
- PNG
- GIF
- WebP

**Videos:**
- MP4
- WebM
- OGG

## Performance Considerations

1. **Image Compression:** All images are automatically compressed to JPEG format at 80% quality before storage
2. **Lazy Loading:** Only load media URLs when needed for display
3. **Pagination:** Use offset/limit parameters when fetching posts
4. **Thumbnails:** Videos are stored with thumbnails for quick preview

## Migration from Firebase

If you're migrating from Firebase Storage:

1. Update imports from `@/lib/services/socialService` to `@/lib/services/turso`
2. Remove Firebase Storage upload code
3. Replace with `uploadMedia()` calls
4. Update image display code to use base64 data URLs
5. Run database migrations

## Troubleshooting

**Issue: "File size exceeds limit"**
- Solution: Adjust `maxImageSize` or `maxVideoSize` in upload options
- Or compress files before upload using external tools

**Issue: "Invalid file type"**
- Solution: Check file MIME type matches allowed formats
- Use `validateFile()` before attempting upload

**Issue: Images not displaying**
- Solution: Ensure you're using `base64ToDataUrl()` to convert base64 to data URL
- Check that media files were uploaded successfully

**Issue: Large database size**
- Solution: Implement storage limits per user
- Use `getUserStorageUsage()` to track usage
- Consider deleting old media or implementing cleanup policies

## Security Notes

1. Always validate files on the client side before upload
2. Enforce storage limits per user
3. Sanitize user content before displaying
4. Use appropriate visibility settings for posts
5. Implement rate limiting for uploads

## Next Steps

- Implement polls functionality (tables already created)
- Add real-time updates using websockets
- Implement notification system for likes/comments
- Add content moderation features
- Create admin dashboard for monitoring uploads
