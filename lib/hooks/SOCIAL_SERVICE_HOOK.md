# Social Service Hook - Abstraction Layer

## Overview

The `useSocialService()` hook provides a **centralized abstraction layer** for all social media operations. This allows you to seamlessly switch between **Firebase** and **Turso** databases by simply changing an environment variable.

## Why Use This Hook?

### ✅ Benefits

1. **Single Source of Truth** - One place to switch database providers
2. **Consistent API** - Same interface regardless of backend
3. **Easy Migration** - Switch from Firebase to Turso with zero code changes
4. **Error Handling** - Built-in error state management
5. **Loading States** - Built-in loading state for UI feedback
6. **Type Safety** - Full TypeScript support

### ❌ Without This Hook (Bad)

```typescript
// Component has to know about implementation details
import { createPost } from '@/lib/services/socialService'; // Firebase
// OR
import { createPost } from '@/lib/services/turso'; // Turso

// Have to manually update every component when switching!
```

### ✅ With This Hook (Good)

```typescript
// Component doesn't care about implementation
import { useSocialService } from '@/lib/hooks/useSocialService';

function MyComponent() {
  const { createPost } = useSocialService();
  // Works with Firebase OR Turso - you decide in .env!
}
```

## Setup

### 1. Configure Database Provider

In `.env.local`:

```env
# Use Firebase
NEXT_PUBLIC_DATABASE_PROVIDER=firebase

# OR use Turso
NEXT_PUBLIC_DATABASE_PROVIDER=turso
```

### 2. Import in Component

```typescript
'use client';

import { useSocialService } from '@/lib/hooks/useSocialService';

export default function MyComponent() {
  const { createPost, getPosts, loading, error } = useSocialService();

  // Use the methods...
}
```

## API Reference

### State

```typescript
const {
  loading,        // boolean - true when any operation is in progress
  error,          // Error | null - last error that occurred
  isUsingTurso,   // boolean - true if using Turso, false if Firebase
} = useSocialService();
```

### Posts

```typescript
// Create a new post
const postId = await createPost({
  userId: string,
  userEmail: string,
  content: string,
  cefrLevel: CEFRLevel,
  visibility: 'public' | 'friends' | 'class' | 'teacher-only',
  mediaType?: 'image' | 'video' | 'poll' | 'none',
  grammarFocus?: string[],
  vocabularyUsed?: string[],
  likesCount: 0,
  commentsCount: 0,
  suggestionsCount: 0,
  sharesCount: 0,
  isEdited: false,
  hasAcceptedSuggestion: false,
});

// Get single post
const post = await getPost(postId);

// Get multiple posts with filters
const { posts, lastDoc } = await getPosts(
  {
    userId?: string,
    cefrLevel?: string,
    visibility?: string,
  },
  limitCount?: number,
  offset?: number
);

// Update post
await updatePost(postId, {
  content?: string,
  isEdited?: boolean,
  hasAcceptedSuggestion?: boolean,
});

// Delete post (cascades to comments, media, etc.)
await deletePost(postId);
```

### Comments

```typescript
// Create comment
const commentId = await createComment({
  postId: string,
  userId: string,
  content: string,
  parentCommentId: string | null,
  likesCount: 0,
});

// Get all comments for a post
const comments = await getComments(postId);

// Delete comment
await deleteComment(commentId, postId);
```

### Suggestions (Grammar Corrections)

```typescript
// Create suggestion
const suggestionId = await createSuggestion({
  postId: string,
  suggestedBy: string,
  suggestedTo: string,
  originalText: string,
  suggestedText: string,
  explanation?: string,
  grammarRule?: string,
  position?: { start: number; end: number },
  type: 'grammar' | 'vocabulary' | 'spelling' | 'style' | 'other',
  severity: 'critical' | 'important' | 'suggestion',
  status: 'pending',
  upvotes: 0,
  downvotes: 0,
});

// Get suggestions for a post
const suggestions = await getSuggestions(postId);

// Update suggestion
await updateSuggestion(suggestionId, {
  status?: 'pending' | 'accepted' | 'rejected' | 'applied',
  acceptedAt?: number,
});

// Accept suggestion (shortcut)
await acceptSuggestion(suggestionId);

// Vote on suggestion
await voteSuggestion(suggestionId, 'up' | 'down');
```

### Likes

```typescript
// Toggle like (returns true if liked, false if unliked)
const isLiked = await toggleLike(userId, targetId, 'post' | 'comment');

// Check if user has liked
const hasLiked = await hasUserLiked(userId, targetId);
```

### Shares

```typescript
// Share a post
const shareId = await sharePost({
  postId: string,
  sharedBy: string,
  shareType: 'repost' | 'quote' | 'external',
  quoteText?: string,
});
```

### User Stats

```typescript
// Get user's social statistics
const stats = await getUserSocialStats(userId);
// Returns:
// {
//   postsCount: number,
//   suggestionsGiven: number,
//   suggestionsReceived: number,
//   acceptanceRate: number,
// }
```

## Usage Examples

### Example 1: Create Post Component

```typescript
'use client';

import { useState } from 'react';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';

export default function CreatePostForm({ userId }: { userId: string }) {
  const [content, setContent] = useState('');
  const { createPost, loading } = useSocialService();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const postId = await createPost({
        userId,
        userEmail: userId,
        content,
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

      success('Post created successfully!');
      setContent('');
    } catch (err) {
      error('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write in German..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

### Example 2: Display Posts

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { Post } from '@/lib/models/social';

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { getPosts, loading } = useSocialService();

  useEffect(() => {
    async function loadPosts() {
      try {
        const { posts } = await getPosts({ cefrLevel: 'A2' }, 20, 0);
        setPosts(posts);
      } catch (err) {
        console.error('Failed to load posts:', err);
      }
    }

    loadPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map((post) => (
        <div key={post.postId}>
          <p>{post.content}</p>
          <span>{post.likesCount} likes</span>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Like Button

```typescript
'use client';

import { useState } from 'react';
import { useSocialService } from '@/lib/hooks/useSocialService';

export default function LikeButton({
  postId,
  userId,
  initialLiked,
}: {
  postId: string;
  userId: string;
  initialLiked: boolean;
}) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const { toggleLike, loading } = useSocialService();

  const handleLike = async () => {
    try {
      const liked = await toggleLike(userId, postId, 'post');
      setIsLiked(liked);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <button onClick={handleLike} disabled={loading}>
      {isLiked ? '❤️ Liked' : '🤍 Like'}
    </button>
  );
}
```

### Example 4: Comment Section

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';
import { Comment } from '@/lib/models/social';

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { createComment, getComments, loading } = useSocialService();
  const { success, error } = useToast();

  useEffect(() => {
    async function loadComments() {
      const commentsData = await getComments(postId);
      setComments(commentsData);
    }
    loadComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createComment({
        postId,
        userId,
        content: newComment,
        parentCommentId: null,
        likesCount: 0,
      });

      success('Comment posted!');
      setNewComment('');

      // Refresh
      const updated = await getComments(postId);
      setComments(updated);
    } catch (err) {
      error('Failed to post comment');
    }
  };

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.commentId}>
          <p>{comment.content}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Post
        </button>
      </form>
    </div>
  );
}
```

## Switching Providers

### From Firebase to Turso

1. **Run migrations:**
   ```bash
   npx tsx turso/migrate.ts
   ```

2. **Update environment variable:**
   ```env
   # .env.local
   NEXT_PUBLIC_DATABASE_PROVIDER=turso
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

**That's it!** All components using `useSocialService()` now use Turso automatically.

### From Turso to Firebase

1. **Update environment variable:**
   ```env
   # .env.local
   NEXT_PUBLIC_DATABASE_PROVIDER=firebase
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

## Provider Differences

The hook handles these differences automatically:

### Pagination

**Firebase:**
- Uses cursor-based pagination with `lastDoc`
- Returns `{ posts: Post[], lastDoc: QueryDocumentSnapshot }`

**Turso:**
- Uses offset-based pagination
- Returns `{ posts: Post[], lastDoc: null }`

### IDs

**Firebase:**
- Auto-generated document IDs

**Turso:**
- Custom IDs with timestamp: `post_${Date.now()}_${random}`

### Timestamps

**Firebase:**
- Can use `serverTimestamp()` or epoch milliseconds

**Turso:**
- Uses epoch milliseconds: `Date.now()`

## Error Handling

The hook provides built-in error handling:

```typescript
const { createPost, loading, error } = useSocialService();

try {
  await createPost(data);
} catch (err) {
  // Error is automatically set in hook state
  console.log(error); // Access error from hook state
  // Also thrown for manual handling
  console.error('Caught error:', err);
}
```

## Loading States

Use the `loading` state for UI feedback:

```typescript
const { createPost, loading } = useSocialService();

return (
  <button type="submit" disabled={loading}>
    {loading ? 'Posting...' : 'Post'}
  </button>
);
```

## Check Current Provider

```typescript
const { isUsingTurso } = useSocialService();

console.log(isUsingTurso ? 'Using Turso' : 'Using Firebase');
```

Or use the utility function:

```typescript
import { getSocialServiceProvider } from '@/lib/hooks/useSocialService';

const provider = getSocialServiceProvider(); // 'turso' | 'firebase'
```

## Advanced: Extending the Hook

To add new methods:

1. Add method to both service implementations
2. Add method to hook:

```typescript
// In useSocialService.ts

const myNewMethod = useCallback(async (param: string) => {
  setLoading(true);
  setError(null);
  try {
    const service = await getService();
    const result = await service.myNewMethod(param);
    return result;
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed');
    setError(error);
    throw error;
  } finally {
    setLoading(false);
  }
}, []);

return {
  // ... existing methods
  myNewMethod,
};
```

## Best Practices

1. **Always use the hook** - Don't import services directly in components
2. **Handle errors gracefully** - Use try-catch or check `error` state
3. **Show loading states** - Use `loading` state for better UX
4. **Use toasts** - Combine with `useToast()` for user feedback
5. **Keep data fresh** - Refetch after mutations

## Migration Checklist

- [ ] Replace all `import { x } from '@/lib/services/socialService'` with `useSocialService()`
- [ ] Replace all `import { x } from '@/lib/services/turso'` with `useSocialService()`
- [ ] Add `useToast()` for user feedback
- [ ] Use `loading` state for disabled states
- [ ] Test with Firebase (`DATABASE_PROVIDER=firebase`)
- [ ] Test with Turso (`DATABASE_PROVIDER=turso`)
- [ ] Verify all operations work with both providers

## Troubleshooting

**Hook error: "must be used within a component"**
- Ensure you're calling the hook in a client component (`'use client'`)

**Provider not switching**
- Check `.env.local` has correct variable
- Restart dev server after changing env vars
- Check `isUsingTurso` to verify provider

**Operations failing**
- Check browser console for detailed errors
- Verify database is set up (Firebase or Turso)
- Check network tab for failed requests

## Summary

The `useSocialService()` hook is your **single source of truth** for all social media operations. It abstracts away provider-specific details and gives you the flexibility to switch databases with a single environment variable change.

**Benefits:**
- ✅ One place to change database provider
- ✅ Consistent API across all components
- ✅ Built-in loading and error states
- ✅ Easy migration from Firebase to Turso
- ✅ Type-safe operations

**Use it everywhere for social media features!**
