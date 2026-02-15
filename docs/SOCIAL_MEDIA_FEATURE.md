# Social Media Feature - DeutschCraft Web V2

## Overview

This document describes the social media feature designed for the DeutschCraft German learning platform. The key innovation is the **suggestion/correction system** that allows students and teachers to help each other improve their German writing.

## Core Concept

Students write posts in German at their CEFR level. Other users (students and teachers) can suggest corrections to grammar, vocabulary, spelling, or style. This creates a collaborative learning environment where mistakes become learning opportunities with a **visible history** of corrections.

## Data Models

All models are defined in `lib/models/social.ts`

### Post
- Main content entity for user posts
- Tracks engagement (likes, comments, suggestions)
- Includes CEFR level and grammar focus tags
- Supports media (images, videos, polls)
- Visibility controls (public, friends, class, teacher-only)

### Suggestion
- Core feature: corrections suggested by others
- Includes:
  - Original text and suggested text
  - Explanation and grammar rule reference
  - Type (grammar, vocabulary, spelling, style, other)
  - Severity (critical, important, suggestion)
  - Status (pending, accepted, rejected, applied)
  - Community voting (upvotes/downvotes)

### Comment
- Standard comments on posts
- Supports nested replies

### PostEditHistory
- Tracks all changes to posts
- Links to accepted suggestions
- Shows learning progression

### Like, Share, Poll, PollVote
- Standard social media engagement models

## Component Architecture

All components are in `components/social/`

### Core Components

#### `PostCard.tsx`
- Main post display component
- Shows author info, content, media, engagement
- Toggles for comments and suggestions
- Handles all post interactions

#### `SuggestionHighlight.tsx`
- **Key feature component**
- Highlights text with pending/accepted suggestions
- Color-coded by suggestion type:
  - Grammar: Yellow/Warning
  - Vocabulary: Blue/Info
  - Spelling: Red/Danger
  - Style: Purple/Primary
- Click to view suggestion details
- Shows tooltip with correction and explanation

#### `SuggestionModal.tsx`
- Form for submitting new suggestions
- Fields:
  - Original text (to be corrected)
  - Suggested text (correction)
  - Type and severity dropdowns
  - Explanation (why the correction is better)
  - Grammar rule (optional reference)
- Live preview of suggestion

### UI Components

#### `UserAvatar.tsx`
- Reusable avatar component
- Supports sizes (xs, sm, md, lg, xl)
- Story indicator option
- Fallback to initials if no photo

#### `PostActions.tsx`
- Action buttons below posts
- Like, Comment, Suggest, Share
- Conditionally shows "Suggest" (not for own posts)

#### `CommentSection.tsx`
- Comment display and creation
- Nested replies support
- Load more functionality

#### `PostMedia.tsx`
- Handles image/video display
- Smart layouts for 1-4+ images
- Video player integration

#### `CreatePost.tsx`
- Post composition form
- Media upload support
- Shows user's CEFR level context

#### `ProfileSidebar.tsx`
- User profile card for sidebar
- Shows stats (posts, followers, following)
- Learning progress for students
- Suggestion stats (given, received, acceptance rate)
- Navigation links

## Key Features

### 1. Suggestion/Correction System

**How it works:**
1. User A writes a post in German
2. User B notices an error and clicks "Suggest"
3. User B selects the incorrect text and provides:
   - Corrected version
   - Explanation
   - Grammar rule (if applicable)
4. Suggestion appears as highlighted text in the post
5. User A can accept or reject the suggestion
6. If accepted, the post can be edited with the correction
7. Edit history is preserved

**Visual Indicators:**
- Wavy underlines show suggested corrections
- Color-coded by type
- Hover to see suggestion details
- "?" indicator for pending suggestions

### 2. Learning History

Every time a post is edited based on a suggestion:
- `PostEditHistory` record is created
- Shows before/after text
- Links to the suggestion
- Visible to user and teacher
- Helps track improvement over time

### 3. Community Validation

- Users can upvote/downvote suggestions
- High-quality suggestions get visibility
- Builds trust in the community
- Teachers' suggestions carry more weight

### 4. Engagement Metrics

Each user has:
- **Suggestions Given**: How many corrections they've provided
- **Suggestions Received**: How many they've gotten
- **Acceptance Rate**: % of their suggestions accepted
- Encourages quality over quantity

## Usage Example

```tsx
// In a feed page
import PostCard from '@/components/social/PostCard';
import CreatePost from '@/components/social/CreatePost';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  return (
    <div>
      <CreatePost
        currentUserId={session.user.email}
        userLevel={currentUser.cefrLevel}
        onSubmit={handleCreatePost}
      />

      {posts.map(post => (
        <PostCard
          key={post.postId}
          post={post}
          author={users[post.userId]}
          currentUserId={session.user.email}
          onLike={() => handleLike(post.postId)}
          onSuggest={() => handleSuggest(post)}
        />
      ))}
    </div>
  );
}
```

## Firestore Structure

```
posts/{postId}
  - userId, content, mediaUrls, cefrLevel
  - likesCount, commentsCount, suggestionsCount
  - createdAt, updatedAt

suggestions/{suggestionId}
  - postId, suggestedBy, suggestedTo
  - originalText, suggestedText
  - explanation, grammarRule
  - type, severity, status
  - upvotes, downvotes
  - createdAt

comments/{commentId}
  - postId, userId, parentCommentId
  - content, likesCount
  - createdAt

postEditHistory/{editId}
  - postId, userId
  - previousContent, newContent
  - appliedSuggestionId
  - createdAt

likes/{likeId}
  - userId, targetId, targetType
  - createdAt
```

## Teacher Features

Teachers have special privileges:
1. Can edit any student post (for major corrections)
2. Their suggestions appear with "Teacher" badge
3. Can view all student suggestion history
4. Dashboard shows class-wide correction trends
5. Can identify common mistakes across students

## Student Features

Students benefit from:
1. Peer learning through suggestions
2. Building confidence by helping others
3. Gamification (acceptance rate, suggestion count)
4. Visual learning (see corrections in context)
5. Track improvement over time

## Future Enhancements

1. **AI-Powered Suggestions**: Auto-detect common errors
2. **Grammar Patterns**: Group similar corrections
3. **Achievement Badges**: For helpful community members
4. **Suggestion Templates**: Pre-written grammar rule explanations
5. **Export to Flashcards**: Turn corrections into study material
6. **Voice Posts**: Practice pronunciation
7. **Suggestion Challenges**: Gamified correction exercises

## Best Practices

1. **Always provide explanations**: Help users understand WHY
2. **Be kind and encouraging**: Focus on learning, not criticizing
3. **Reference grammar rules**: Help users learn the pattern
4. **Accept suggestions gracefully**: It's all about improvement
5. **Vote on good suggestions**: Support quality corrections

## Integration with Existing Features

- **Flashcards**: Corrections can become flashcard content
- **CEFR Levels**: Suggestions adapted to user level
- **Teacher Dashboard**: View student correction patterns
- **Writing Exercises**: Social posts as practice material
- **Vocabulary Lists**: Extract new words from posts

## Technical Notes

- All components use TypeScript for type safety
- Follows project's design system (colors, spacing)
- Responsive design (mobile-first)
- Real-time updates via Firestore listeners
- Optimistic UI updates for better UX
- Lazy loading for comments and suggestions
- Image optimization for media uploads

## Styling

Uses existing design system from `lib/design-system.ts`:
- Primary: #0f6fec (Blue)
- Success: #12bc87 (Green) - for accepted suggestions
- Warning: #f7c32e (Yellow) - for grammar suggestions
- Danger: #d6293e (Red) - for spelling errors
- Info: #4f9ef8 (Light Blue) - for vocabulary

## Testing Considerations

1. Test suggestion highlighting with various text lengths
2. Verify edit history preserves all versions
3. Check permission controls (can't suggest on own posts)
4. Test nested comments performance
5. Validate media upload and display
6. Test real-time updates across users

---

**Last Updated**: December 2025
**Status**: Ready for implementation
**Next Steps**:
1. Set up Firestore collections
2. Implement API routes for CRUD operations
3. Add real-time listeners
4. Integrate with existing auth system
5. Deploy and test with pilot users
