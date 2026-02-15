# Social Media Feature - Turso Implementation

## Overview

Complete social media feature for German language learning, using **Turso SQLite** database with built-in file upload support. No Firebase Storage required!

### Key Features

✅ **Posts** - Create, read, update, delete posts in German
✅ **Media Uploads** - Images and videos stored as base64 in Turso
✅ **Comments** - Nested comments with threading support
✅ **Suggestions** - Grammar/vocabulary corrections from peers
✅ **Likes** - Like posts and comments
✅ **Shares** - Share posts with quotes
✅ **Polls** - Create polls (tables ready, implementation pending)
✅ **CEFR Levels** - Filter content by proficiency level (A1-C2)
✅ **Visibility Controls** - Public, friends, class, teacher-only
✅ **Storage Management** - Track and limit user storage usage

### Technologies

- **Database:** Turso (LibSQL/SQLite)
- **Storage:** Base64 encoding in SQLite (no external storage needed)
- **Image Processing:** Browser-based compression
- **Video Processing:** Thumbnail generation in browser
- **Type Safety:** Full TypeScript support

## Quick Start

### 1. Setup Database

```bash
# Ensure Turso credentials are in .env.local
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here
DATABASE_PROVIDER=turso

# Run migrations
npx tsx turso/migrate.ts
```

### 2. Import Services

```typescript
import {
  // Posts
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,

  // Media
  uploadMedia,
  getPostMedia,
  getPostMediaUrls,

  // Comments
  createComment,
  getComments,

  // Suggestions
  createSuggestion,
  getSuggestions,
  acceptSuggestion,

  // Likes
  toggleLike,
  hasUserLiked,

  // Stats
  getUserSocialStats,
} from '@/lib/services/turso';
```

### 3. Create a Post

```typescript
const postId = await createPost({
  userId: 'user@example.com',
  userEmail: 'user@example.com',
  content: 'Ich lerne Deutsch!',
  cefrLevel: 'A2',
  visibility: 'public',
  likesCount: 0,
  commentsCount: 0,
  suggestionsCount: 0,
  sharesCount: 0,
  isEdited: false,
  hasAcceptedSuggestion: false,
});
```

### 4. Upload Media

```typescript
// Validate and upload image
const validation = validateFile(imageFile, 'image');
if (validation.valid) {
  const mediaId = await uploadMedia(postId, userId, imageFile, {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    imageQuality: 0.8, // 80% quality
    maxImageDimension: 1920, // Max 1920px
  });
}
```

## Database Schema

### Tables Created

7 migration files create these tables:

1. **`social_posts`** - User posts with learning context
   - Columns: post_id, user_id, content, media_type, cefr_level, visibility, engagement counts, timestamps
   - Indexes: user_id, cefr_level, visibility, created_at

2. **`social_media`** - Media files as base64
   - Columns: media_id, post_id, user_id, media_type, mime_type, data (base64), thumbnail_data, dimensions, file_size
   - Indexes: post_id, user_id

3. **`social_comments`** - Comments with nesting
   - Columns: comment_id, post_id, user_id, parent_comment_id, content, likes_count
   - Indexes: post_id, user_id, parent_comment_id

4. **`social_suggestions`** - Grammar corrections
   - Columns: suggestion_id, post_id, suggested_by, suggested_to, original_text, suggested_text, explanation, grammar_rule, type, severity, status, upvotes/downvotes
   - Indexes: post_id, suggested_by, suggested_to, status, upvotes

5. **`social_likes`** - Like tracking
   - Columns: like_id (composite), user_id, target_id, target_type
   - Indexes: user_id, target_id, target_type
   - Unique constraint: (user_id, target_id)

6. **`social_shares`** - Share tracking
   - Columns: share_id, post_id, shared_by, share_type, quote_text
   - Indexes: post_id, shared_by

7. **`social_polls` & `social_poll_votes`** - Polls (ready for implementation)
   - Poll options, voting, results visibility

## File Upload Architecture

### How It Works

1. **Client-side Processing:**
   - File validation (type, size)
   - Image compression (canvas API)
   - Video thumbnail generation (video element)
   - Base64 encoding

2. **Storage:**
   - Base64 data stored in `social_media` table
   - No external storage service required
   - All data in single database

3. **Retrieval:**
   - Query database for base64 data
   - Convert to data URL for display
   - Cache in browser for performance

### Advantages

✅ No Firebase Storage costs
✅ No S3 bucket configuration
✅ Simpler architecture (single DB)
✅ Atomic operations (post + media in one transaction)
✅ Easy backup (full database includes media)
✅ No CORS issues

### Limitations

⚠️ Base64 encoding increases size by ~33%
⚠️ Not suitable for very large files (>50MB)
⚠️ SQLite performance may degrade with thousands of media files
⚠️ No CDN caching (all requests hit database)

**Recommendation:** This approach works great for:
- Educational platforms with moderate media usage
- MVP/prototype applications
- Small to medium user bases (<10k users)

For high-traffic production apps, consider:
- Hybrid approach (thumbnails in DB, full files in CDN)
- Upgrade to external storage when limits reached

## API Reference

### Posts

```typescript
// Create post
createPost(data: Omit<Post, 'postId' | 'createdAt' | 'updatedAt'>): Promise<string>

// Get single post
getPost(postId: string): Promise<Post | null>

// Get multiple posts with filters
getPosts(
  filters?: { userId?, cefrLevel?, visibility? },
  limit?: number,
  offset?: number
): Promise<Post[]>

// Update post
updatePost(postId: string, updates: Partial<Post>): Promise<void>

// Delete post (cascades to media, comments, etc.)
deletePost(postId: string): Promise<void>
```

### Media

```typescript
// Upload file (auto-compresses images)
uploadMedia(
  postId: string,
  userId: string,
  file: File,
  options?: UploadOptions
): Promise<string>

// Get media file
getMedia(mediaId: string): Promise<MediaFile | null>

// Get all media for post
getPostMedia(postId: string): Promise<MediaFile[]>

// Get media as data URLs
getPostMediaUrls(postId: string): Promise<string[]>

// Delete media
deleteMedia(mediaId: string): Promise<void>

// Get user storage usage
getUserStorageUsage(userId: string): Promise<number>

// Get storage statistics
getStorageStats(userId: string): Promise<{
  totalSize: number;
  imageCount: number;
  videoCount: number;
  imageSize: number;
  videoSize: number;
}>
```

### Comments

```typescript
// Create comment
createComment(data: Omit<Comment, 'commentId' | 'createdAt' | 'updatedAt'>): Promise<string>

// Get comments for post
getComments(postId: string): Promise<Comment[]>

// Delete comment
deleteComment(commentId: string, postId: string): Promise<void>
```

### Suggestions

```typescript
// Create suggestion
createSuggestion(data: Omit<Suggestion, 'suggestionId' | 'createdAt' | 'updatedAt'>): Promise<string>

// Get suggestions for post
getSuggestions(postId: string): Promise<Suggestion[]>

// Update suggestion
updateSuggestion(suggestionId: string, updates: Partial<Suggestion>): Promise<void>

// Accept suggestion
acceptSuggestion(suggestionId: string): Promise<void>

// Vote on suggestion
voteSuggestion(suggestionId: string, vote: 'up' | 'down'): Promise<void>
```

### Likes

```typescript
// Toggle like (returns true if liked, false if unliked)
toggleLike(userId: string, targetId: string, targetType: 'post' | 'comment'): Promise<boolean>

// Check if user liked
hasUserLiked(userId: string, targetId: string): Promise<boolean>
```

### Stats

```typescript
// Get user social statistics
getUserSocialStats(userId: string): Promise<{
  postsCount: number;
  suggestionsGiven: number;
  suggestionsReceived: number;
  acceptanceRate: number;
}>
```

## Usage Examples

See `lib/services/turso/SOCIAL_MEDIA_USAGE.md` for comprehensive examples including:
- Creating posts with media
- Fetching and displaying posts
- Comment threading
- Grammar suggestions
- Like interactions
- Storage management
- Complete React component examples

## Migration Guide

### From Firebase to Turso

1. **Update imports:**
   ```typescript
   // Before
   import { createPost } from '@/lib/services/socialService';

   // After
   import { createPost } from '@/lib/services/turso';
   ```

2. **Remove Firebase Storage code:**
   ```typescript
   // Before
   import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
   const storageRef = ref(storage, `posts/${postId}/${file.name}`);
   await uploadBytes(storageRef, file);
   const url = await getDownloadURL(storageRef);

   // After
   const mediaId = await uploadMedia(postId, userId, file);
   ```

3. **Update image display:**
   ```typescript
   // Before
   <img src={firebaseUrl} />

   // After
   const media = await getMedia(mediaId);
   const dataUrl = base64ToDataUrl(media.data, media.mimeType);
   <img src={dataUrl} />
   ```

4. **Run migrations:**
   ```bash
   npx tsx turso/migrate.ts
   ```

## File Size Recommendations

### Default Limits

- **Images:** 5MB max (post-compression)
- **Videos:** 50MB max
- **Total per user:** Configure based on needs (use `getUserStorageUsage()`)

### Optimal Settings

For best performance:
- Image quality: 80% (good balance of quality/size)
- Max dimension: 1920px (Full HD is sufficient)
- Video: Encourage short clips (<30 seconds)

### Scaling Considerations

If you need to support larger files or more users:
1. Implement storage quotas per user/tier
2. Add cleanup jobs for old media
3. Consider hybrid storage (Turso for metadata, CDN for files)
4. Use Turso's edge replication for faster reads

## Security Best Practices

1. **Validate files client-side:**
   ```typescript
   const validation = validateFile(file, mediaType);
   if (!validation.valid) throw new Error(validation.error);
   ```

2. **Enforce storage limits:**
   ```typescript
   const usage = await getUserStorageUsage(userId);
   const limit = 100 * 1024 * 1024; // 100MB
   if (usage + fileSize > limit) throw new Error('Storage limit exceeded');
   ```

3. **Sanitize content:**
   - Use DOMPurify for user-generated HTML
   - Escape special characters in SQL queries (handled by Turso client)

4. **Rate limiting:**
   - Implement upload rate limits (e.g., 10 uploads per hour)
   - Use middleware to track requests per IP/user

5. **Visibility controls:**
   - Always check user permissions before showing posts
   - Filter posts by visibility setting

## Performance Tips

1. **Lazy load media:**
   - Only fetch media URLs when posts are in viewport
   - Use Intersection Observer API

2. **Pagination:**
   - Always use `limit` and `offset` parameters
   - Implement infinite scroll or pagination

3. **Caching:**
   - Cache converted data URLs in component state
   - Use React Query or SWR for automatic caching

4. **Batch operations:**
   - Fetch media for multiple posts in parallel
   - Use `Promise.all()` for concurrent requests

5. **Optimize queries:**
   - Add indexes for commonly filtered fields
   - Use `SELECT` only columns you need (modify service if needed)

## Troubleshooting

### Common Issues

**Problem:** Images not displaying
**Solution:** Check console for base64 decoding errors. Ensure media was uploaded successfully.

**Problem:** "File size exceeds limit"
**Solution:** Adjust `maxImageSize` in upload options or compress image more aggressively.

**Problem:** Slow loading with many posts
**Solution:** Implement pagination. Don't fetch all posts at once.

**Problem:** Database size growing too fast
**Solution:** Implement cleanup policies for old/unused media. Monitor with `getStorageStats()`.

**Problem:** Migration failed
**Solution:** Check Turso credentials in `.env.local`. Ensure database is accessible.

## Next Steps

### Completed
✅ Database schema (7 migration files)
✅ Social service (posts, comments, suggestions, likes, shares)
✅ Media service (upload, compression, storage, retrieval)
✅ Type definitions
✅ Documentation

### To Implement
- [ ] Poll functionality (tables ready, need UI)
- [ ] Real-time updates (websockets/SSE)
- [ ] Notification system
- [ ] Content moderation
- [ ] Search functionality
- [ ] Admin dashboard

## Support

For issues or questions:
1. Check this documentation
2. Review `SOCIAL_MEDIA_USAGE.md` for code examples
3. Check Turso documentation: https://docs.turso.tech
4. Report bugs in GitHub issues

## License

Part of DeutschCraft Web V2 project.
