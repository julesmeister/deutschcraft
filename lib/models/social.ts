/**
 * Social Media Models
 * Collections for posts, comments, suggestions, and interactions
 *
 * Collections:
 * - posts/{postId}
 * - comments/{commentId}
 * - suggestions/{suggestionId}
 * - likes/{likeId}
 */

import { CEFRLevel } from './cefr';

/**
 * Post Model
 * Path: posts/{postId}
 * A user's social media post in German
 */
export interface Post {
  postId: string;
  userId: string; // Email of the user who created the post
  userEmail: string; // For easy querying

  // Content
  content: string; // The German text content
  mediaUrls?: string[]; // Optional images/videos
  mediaType?: 'image' | 'video' | 'poll' | 'none';

  // Language Learning Context
  cefrLevel: CEFRLevel; // The level at which this was posted
  grammarFocus?: string[]; // Optional grammar points being practiced
  vocabularyUsed?: string[]; // Key vocabulary words used

  // Engagement Metrics
  likesCount: number;
  commentsCount: number;
  suggestionsCount: number;
  sharesCount: number;

  // Visibility
  visibility: 'public' | 'friends' | 'class' | 'teacher-only';

  // Status
  isEdited: boolean;
  hasAcceptedSuggestion: boolean; // If user accepted any correction

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Comment Model
 * Path: comments/{commentId}
 * Comments on posts
 */
export interface Comment {
  commentId: string;
  postId: string; // Which post this belongs to
  userId: string; // Email of commenter
  parentCommentId?: string | null; // For nested replies

  content: string;

  // Engagement
  likesCount: number;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Suggestion Model
 * Path: suggestions/{suggestionId}
 * Grammar/vocabulary corrections for posts
 */
export interface Suggestion {
  suggestionId: string;
  postId: string;
  suggestedBy: string; // Email of user who suggested
  suggestedTo: string; // Email of post author

  // Original and suggested text
  originalText: string; // The text that needs correction
  suggestedText: string; // The corrected version

  // Context
  explanation?: string; // Why this correction is better
  grammarRule?: string; // Which grammar rule applies
  position?: { // Location in the post
    start: number;
    end: number;
  };

  // Type of suggestion
  type: 'grammar' | 'vocabulary' | 'spelling' | 'style' | 'other';
  severity: 'critical' | 'important' | 'suggestion';

  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'applied';
  acceptedAt?: number | null;

  // Engagement (other users can upvote good suggestions)
  upvotes: number;
  downvotes: number;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Post Edit History
 * Track changes to posts when suggestions are applied
 */
export interface PostEditHistory {
  editId: string;
  postId: string;
  userId: string;

  previousContent: string;
  newContent: string;

  appliedSuggestionId?: string; // If this edit came from a suggestion
  editReason: 'manual' | 'suggestion-applied' | 'typo-fix';

  createdAt: number;
}

/**
 * Like Model
 * Path: likes/{likeId}
 * Likes for posts and comments
 */
export interface Like {
  likeId: string;
  userId: string; // Who liked
  targetId: string; // postId or commentId
  targetType: 'post' | 'comment';

  createdAt: number;
}

/**
 * Share Model
 * When users share posts
 */
export interface Share {
  shareId: string;
  postId: string;
  sharedBy: string; // User email
  shareType: 'repost' | 'quote' | 'external';
  quoteText?: string; // If quote-sharing, what they said

  createdAt: number;
}

/**
 * Poll Model (for poll-type posts)
 * Embedded in Post when mediaType is 'poll'
 */
export interface Poll {
  question: string;
  options: PollOption[];
  allowMultipleAnswers: boolean;
  expiresAt: number | null; // Null means no expiration
  resultsVisibleTo: 'everyone' | 'voters-only' | 'author-only';
}

export interface PollOption {
  optionId: string;
  text: string;
  votes: number;
  voters: string[]; // User emails who voted for this
}

/**
 * Poll Vote
 * Separate collection for tracking votes
 */
export interface PollVote {
  voteId: string;
  pollId: string;
  postId: string;
  userId: string;
  selectedOptions: string[]; // Array of optionIds

  createdAt: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a user can edit a post
 */
export function canEditPost(post: Post, userId: string, userRole: string): boolean {
  // Author can edit their own posts
  if (post.userId === userId) return true;

  // Teachers can edit any post for correction purposes
  if (userRole === 'TEACHER') return true;

  return false;
}

/**
 * Check if a user can suggest corrections
 */
export function canSuggestCorrections(post: Post, userId: string): boolean {
  // Can't suggest corrections to your own post
  if (post.userId === userId) return false;

  return true;
}

/**
 * Calculate suggestion acceptance rate for a user
 */
export function getSuggestionAcceptanceRate(
  acceptedCount: number,
  totalSuggestions: number
): number {
  if (totalSuggestions === 0) return 0;
  return (acceptedCount / totalSuggestions) * 100;
}

/**
 * Format post content with applied suggestions
 */
export function applyHighlights(
  content: string,
  suggestions: Suggestion[]
): { text: string; highlights: Array<{ start: number; end: number; type: string }> } {
  const highlights = suggestions
    .filter(s => s.status === 'accepted' || s.status === 'pending')
    .map(s => ({
      start: s.position?.start || 0,
      end: s.position?.end || 0,
      type: s.type
    }));

  return {
    text: content,
    highlights
  };
}

/**
 * Get post engagement score
 */
export function getPostEngagementScore(post: Post): number {
  return (
    post.likesCount * 1 +
    post.commentsCount * 2 +
    post.suggestionsCount * 3 +
    post.sharesCount * 5
  );
}

/**
 * Check if suggestion is still valid (post hasn't changed)
 */
export function isSuggestionValid(
  suggestion: Suggestion,
  currentPostContent: string
): boolean {
  if (!suggestion.position) return true;

  const { start, end } = suggestion.position;
  const extractedText = currentPostContent.substring(start, end);

  return extractedText === suggestion.originalText;
}
