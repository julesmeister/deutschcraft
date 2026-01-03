/**
 * Social Media Service - Turso Implementation
 * Handles all social media operations using Turso DB
 *
 * This is the Turso-compatible version of socialService.
 * All social-related database operations use LibSQL/SQLite syntax.
 */

import { db } from '@/turso/client';
import { Post, Comment, Suggestion, Like, Share, Poll, PollVote } from '@/lib/models/social';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToPost(row: any): Post {
  return {
    postId: row.post_id as string,
    userId: row.user_id as string,
    userEmail: row.user_email as string,
    content: row.content as string,
    mediaUrls: row.media_type !== 'none' ? [] : undefined, // Will be populated separately
    mediaType: (row.media_type as 'image' | 'video' | 'poll' | 'none') || 'none',
    cefrLevel: row.cefr_level as any,
    grammarFocus: row.grammar_focus ? JSON.parse(row.grammar_focus as string) : undefined,
    vocabularyUsed: row.vocabulary_used ? JSON.parse(row.vocabulary_used as string) : undefined,
    likesCount: row.likes_count as number,
    commentsCount: row.comments_count as number,
    suggestionsCount: row.suggestions_count as number,
    sharesCount: row.shares_count as number,
    visibility: row.visibility as 'public' | 'friends' | 'class' | 'teacher-only',
    isEdited: Boolean(row.is_edited),
    hasAcceptedSuggestion: Boolean(row.has_accepted_suggestion),
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToComment(row: any): Comment {
  return {
    commentId: row.comment_id as string,
    postId: row.post_id as string,
    userId: row.user_id as string,
    parentCommentId: row.parent_comment_id as string | null,
    content: row.content as string,
    likesCount: row.likes_count as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToSuggestion(row: any): Suggestion {
  return {
    suggestionId: row.suggestion_id as string,
    postId: row.post_id as string,
    suggestedBy: row.suggested_by as string,
    suggestedTo: row.suggested_to as string,
    originalText: row.original_text as string,
    suggestedText: row.suggested_text as string,
    explanation: row.explanation as string | undefined,
    grammarRule: row.grammar_rule as string | undefined,
    position: row.position_start && row.position_end ? {
      start: row.position_start as number,
      end: row.position_end as number,
    } : undefined,
    type: row.type as 'grammar' | 'vocabulary' | 'spelling' | 'style' | 'other',
    severity: row.severity as 'critical' | 'important' | 'suggestion',
    status: row.status as 'pending' | 'accepted' | 'rejected' | 'applied',
    acceptedAt: row.accepted_at as number | null,
    upvotes: row.upvotes as number,
    downvotes: row.downvotes as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToLike(row: any): Like {
  return {
    likeId: row.like_id as string,
    userId: row.user_id as string,
    targetId: row.target_id as string,
    targetType: row.target_type as 'post' | 'comment',
    createdAt: row.created_at as number,
  };
}

function rowToShare(row: any): Share {
  return {
    shareId: row.share_id as string,
    postId: row.post_id as string,
    sharedBy: row.shared_by as string,
    shareType: row.share_type as 'repost' | 'quote' | 'external',
    quoteText: row.quote_text as string | undefined,
    createdAt: row.created_at as number,
  };
}

// ============================================================================
// POSTS
// ============================================================================

export async function createPost(postData: Omit<Post, 'postId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  try {
    await db.execute({
      sql: `INSERT INTO social_posts (
        post_id, user_id, user_email, content, media_type,
        cefr_level, grammar_focus, vocabulary_used,
        likes_count, comments_count, suggestions_count, shares_count,
        visibility, is_edited, has_accepted_suggestion,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        postId,
        postData.userId,
        postData.userEmail,
        postData.content,
        postData.mediaType || 'none',
        postData.cefrLevel,
        postData.grammarFocus ? JSON.stringify(postData.grammarFocus) : null,
        postData.vocabularyUsed ? JSON.stringify(postData.vocabularyUsed) : null,
        0, // likes_count
        0, // comments_count
        0, // suggestions_count
        0, // shares_count
        postData.visibility,
        0, // is_edited
        0, // has_accepted_suggestion
        now,
        now,
      ],
    });

    return postId;
  } catch (error) {
    console.error('[socialService:turso] Error creating post:', error);
    throw error;
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM social_posts WHERE post_id = ? LIMIT 1',
      args: [postId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToPost(result.rows[0]);
  } catch (error) {
    console.error('[socialService:turso] Error fetching post:', error);
    throw error;
  }
}

export async function getPosts(
  filters?: {
    userId?: string;
    cefrLevel?: string;
    visibility?: string;
  },
  limitCount: number = 20,
  offset: number = 0
): Promise<Post[]> {
  try {
    let sql = 'SELECT * FROM social_posts WHERE 1=1';
    const args: any[] = [];

    if (filters?.userId) {
      sql += ' AND user_id = ?';
      args.push(filters.userId);
    }

    if (filters?.cefrLevel) {
      sql += ' AND cefr_level = ?';
      args.push(filters.cefrLevel);
    }

    if (filters?.visibility) {
      sql += ' AND visibility = ?';
      args.push(filters.visibility);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(limitCount, offset);

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToPost);
  } catch (error) {
    console.error('[socialService:turso] Error fetching posts:', error);
    throw error;
  }
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.content !== undefined) {
      setClauses.push('content = ?');
      args.push(updates.content);
    }

    if (updates.isEdited !== undefined) {
      setClauses.push('is_edited = ?');
      args.push(updates.isEdited ? 1 : 0);
    }

    if (updates.hasAcceptedSuggestion !== undefined) {
      setClauses.push('has_accepted_suggestion = ?');
      args.push(updates.hasAcceptedSuggestion ? 1 : 0);
    }

    if (setClauses.length === 0) {
      return;
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());
    args.push(postId);

    const sql = `UPDATE social_posts SET ${setClauses.join(', ')} WHERE post_id = ?`;
    await db.execute({ sql, args });
  } catch (error) {
    console.error('[socialService:turso] Error updating post:', error);
    throw error;
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM social_posts WHERE post_id = ?',
      args: [postId],
    });
  } catch (error) {
    console.error('[socialService:turso] Error deleting post:', error);
    throw error;
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function createComment(commentData: Omit<Comment, 'commentId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  try {
    // Start transaction
    await db.execute({
      sql: `INSERT INTO social_comments (
        comment_id, post_id, user_id, parent_comment_id, content,
        likes_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        commentId,
        commentData.postId,
        commentData.userId,
        commentData.parentCommentId || null,
        commentData.content,
        0, // likes_count
        now,
        now,
      ],
    });

    // Increment post comment count
    await db.execute({
      sql: 'UPDATE social_posts SET comments_count = comments_count + 1 WHERE post_id = ?',
      args: [commentData.postId],
    });

    return commentId;
  } catch (error) {
    console.error('[socialService:turso] Error creating comment:', error);
    throw error;
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM social_comments WHERE post_id = ? ORDER BY created_at ASC',
      args: [postId],
    });

    return result.rows.map(rowToComment);
  } catch (error) {
    console.error('[socialService:turso] Error fetching comments:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  try {
    // Delete comment
    await db.execute({
      sql: 'DELETE FROM social_comments WHERE comment_id = ?',
      args: [commentId],
    });

    // Decrement post comment count
    await db.execute({
      sql: 'UPDATE social_posts SET comments_count = comments_count - 1 WHERE post_id = ?',
      args: [postId],
    });
  } catch (error) {
    console.error('[socialService:turso] Error deleting comment:', error);
    throw error;
  }
}

/**
 * Get discussion stats for multiple exercises
 */
export async function getExerciseDiscussionStats(
  exerciseIds: string[]
): Promise<Record<string, { commentCount: number; lastCommentAt: number }>> {
  if (exerciseIds.length === 0) return {};

  try {
    const placeholders = exerciseIds.map(() => '?').join(',');
    
    const sql = `
      SELECT 
        post_id as exercise_id, 
        COUNT(*) as comment_count,
        MAX(created_at) as last_comment
      FROM social_comments 
      WHERE post_id IN (${placeholders})
      GROUP BY post_id
    `;

    const args = [...exerciseIds];
    const result = await db.execute({ sql, args });

    const stats: Record<string, { commentCount: number; lastCommentAt: number }> = {};
    
    for (const row of result.rows) {
      const exerciseId = row.exercise_id as string;
      stats[exerciseId] = {
        commentCount: row.comment_count as number,
        lastCommentAt: row.last_comment as number
      };
    }

    return stats;
  } catch (error) {
    console.error('[socialService:turso] Error fetching discussion stats:', error);
    return {};
  }
}

// ============================================================================
// SUGGESTIONS
// ============================================================================

export async function createSuggestion(suggestionData: Omit<Suggestion, 'suggestionId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const suggestionId = `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  try {
    await db.execute({
      sql: `INSERT INTO social_suggestions (
        suggestion_id, post_id, suggested_by, suggested_to,
        original_text, suggested_text, explanation, grammar_rule,
        position_start, position_end, type, severity, status,
        upvotes, downvotes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        suggestionId,
        suggestionData.postId,
        suggestionData.suggestedBy,
        suggestionData.suggestedTo,
        suggestionData.originalText,
        suggestionData.suggestedText,
        suggestionData.explanation || null,
        suggestionData.grammarRule || null,
        suggestionData.position?.start || null,
        suggestionData.position?.end || null,
        suggestionData.type,
        suggestionData.severity,
        'pending',
        0, // upvotes
        0, // downvotes
        now,
        now,
      ],
    });

    // Increment post suggestion count
    await db.execute({
      sql: 'UPDATE social_posts SET suggestions_count = suggestions_count + 1 WHERE post_id = ?',
      args: [suggestionData.postId],
    });

    return suggestionId;
  } catch (error) {
    console.error('[socialService:turso] Error creating suggestion:', error);
    throw error;
  }
}

export async function getSuggestions(postId: string): Promise<Suggestion[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM social_suggestions WHERE post_id = ? ORDER BY upvotes DESC',
      args: [postId],
    });

    return result.rows.map(rowToSuggestion);
  } catch (error) {
    console.error('[socialService:turso] Error fetching suggestions:', error);
    throw error;
  }
}

export async function updateSuggestion(suggestionId: string, updates: Partial<Suggestion>): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      args.push(updates.status);
    }

    if (updates.acceptedAt !== undefined) {
      setClauses.push('accepted_at = ?');
      args.push(updates.acceptedAt);
    }

    if (setClauses.length === 0) {
      return;
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());
    args.push(suggestionId);

    const sql = `UPDATE social_suggestions SET ${setClauses.join(', ')} WHERE suggestion_id = ?`;
    await db.execute({ sql, args });
  } catch (error) {
    console.error('[socialService:turso] Error updating suggestion:', error);
    throw error;
  }
}

export async function acceptSuggestion(suggestionId: string): Promise<void> {
  try {
    const now = Date.now();

    // Get suggestion details
    const suggestionResult = await db.execute({
      sql: 'SELECT post_id, original_text, suggested_text FROM social_suggestions WHERE suggestion_id = ? LIMIT 1',
      args: [suggestionId],
    });

    if (suggestionResult.rows.length === 0) {
      throw new Error('Suggestion not found');
    }

    const row = suggestionResult.rows[0];
    const postId = row.post_id as string;
    const originalText = row.original_text as string;
    const suggestedText = row.suggested_text as string;

    // Get current post content
    const postResult = await db.execute({
      sql: 'SELECT content FROM social_posts WHERE post_id = ? LIMIT 1',
      args: [postId],
    });

    if (postResult.rows.length === 0) {
      throw new Error('Post not found');
    }

    const currentContent = postResult.rows[0].content as string;

    // Determine updated content
    let updatedContent: string;
    if (originalText === currentContent) {
      updatedContent = suggestedText;
      console.log('[socialService:turso] Replacing entire post content');
    } else if (currentContent.includes(originalText)) {
      updatedContent = currentContent.replace(originalText, suggestedText);
      console.log('[socialService:turso] Replacing matched portion');
    } else {
      console.warn('[socialService:turso] Original text not found, using suggested text as full replacement');
      updatedContent = suggestedText;
    }

    console.log('[socialService:turso] Accepting suggestion:', {
      original: originalText,
      suggested: suggestedText,
      currentContent,
      updatedContent,
      changed: currentContent !== updatedContent
    });

    // Update suggestion status
    await db.execute({
      sql: 'UPDATE social_suggestions SET status = ?, accepted_at = ?, updated_at = ? WHERE suggestion_id = ?',
      args: ['accepted', now, now, suggestionId],
    });

    // Update post with corrected content
    await db.execute({
      sql: 'UPDATE social_posts SET content = ?, has_accepted_suggestion = 1, is_edited = 1, updated_at = ? WHERE post_id = ?',
      args: [updatedContent, now, postId],
    });
  } catch (error) {
    console.error('[socialService:turso] Error accepting suggestion:', error);
    throw error;
  }
}

export async function voteSuggestion(suggestionId: string, vote: 'up' | 'down'): Promise<void> {
  try {
    const column = vote === 'up' ? 'upvotes' : 'downvotes';
    await db.execute({
      sql: `UPDATE social_suggestions SET ${column} = ${column} + 1 WHERE suggestion_id = ?`,
      args: [suggestionId],
    });
  } catch (error) {
    console.error('[socialService:turso] Error voting suggestion:', error);
    throw error;
  }
}

// ============================================================================
// LIKES
// ============================================================================

export async function toggleLike(userId: string, targetId: string, targetType: 'post' | 'comment'): Promise<boolean> {
  const likeId = `${userId}_${targetId}`;

  try {
    // Check if like exists
    const checkResult = await db.execute({
      sql: 'SELECT like_id FROM social_likes WHERE like_id = ? LIMIT 1',
      args: [likeId],
    });

    if (checkResult.rows.length > 0) {
      // Unlike
      await db.execute({
        sql: 'DELETE FROM social_likes WHERE like_id = ?',
        args: [likeId],
      });

      // Decrement likes count
      const table = targetType === 'post' ? 'social_posts' : 'social_comments';
      const idColumn = targetType === 'post' ? 'post_id' : 'comment_id';
      await db.execute({
        sql: `UPDATE ${table} SET likes_count = likes_count - 1 WHERE ${idColumn} = ?`,
        args: [targetId],
      });

      return false;
    } else {
      // Like
      await db.execute({
        sql: 'INSERT INTO social_likes (like_id, user_id, target_id, target_type, created_at) VALUES (?, ?, ?, ?, ?)',
        args: [likeId, userId, targetId, targetType, Date.now()],
      });

      // Increment likes count
      const table = targetType === 'post' ? 'social_posts' : 'social_comments';
      const idColumn = targetType === 'post' ? 'post_id' : 'comment_id';
      await db.execute({
        sql: `UPDATE ${table} SET likes_count = likes_count + 1 WHERE ${idColumn} = ?`,
        args: [targetId],
      });

      return true;
    }
  } catch (error) {
    console.error('[socialService:turso] Error toggling like:', error);
    throw error;
  }
}

export async function hasUserLiked(userId: string, targetId: string): Promise<boolean> {
  try {
    const likeId = `${userId}_${targetId}`;
    const result = await db.execute({
      sql: 'SELECT like_id FROM social_likes WHERE like_id = ? LIMIT 1',
      args: [likeId],
    });

    return result.rows.length > 0;
  } catch (error) {
    console.error('[socialService:turso] Error checking like:', error);
    throw error;
  }
}

// ============================================================================
// SHARES
// ============================================================================

export async function sharePost(shareData: Omit<Share, 'shareId' | 'createdAt'>): Promise<string> {
  const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    await db.execute({
      sql: 'INSERT INTO social_shares (share_id, post_id, shared_by, share_type, quote_text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        shareId,
        shareData.postId,
        shareData.sharedBy,
        shareData.shareType,
        shareData.quoteText || null,
        Date.now(),
      ],
    });

    // Increment post share count
    await db.execute({
      sql: 'UPDATE social_posts SET shares_count = shares_count + 1 WHERE post_id = ?',
      args: [shareData.postId],
    });

    return shareId;
  } catch (error) {
    console.error('[socialService:turso] Error sharing post:', error);
    throw error;
  }
}

// ============================================================================
// POLLS
// ============================================================================

export async function votePoll(pollVote: Omit<PollVote, 'voteId' | 'createdAt'>): Promise<string> {
  const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  try {
    await db.execute({
      sql: 'INSERT INTO social_poll_votes (vote_id, poll_id, user_id, option_index, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [
        voteId,
        pollVote.pollId,
        pollVote.userId,
        pollVote.optionIndex,
        now,
      ],
    });

    return voteId;
  } catch (error) {
    console.error('[socialService:turso] Error voting poll:', error);
    throw error;
  }
}

export async function getPollVotes(pollId: string): Promise<PollVote[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM social_poll_votes WHERE poll_id = ?',
      args: [pollId],
    });

    return result.rows.map((row: any) => ({
      voteId: row.vote_id as string,
      pollId: row.poll_id as string,
      userId: row.user_id as string,
      optionIndex: row.option_index as number,
      createdAt: row.created_at as number,
    }));
  } catch (error) {
    console.error('[socialService:turso] Error fetching poll votes:', error);
    throw error;
  }
}

// ============================================================================
// USER STATS
// ============================================================================

export async function getUserSocialStats(userId: string): Promise<{
  postsCount: number;
  suggestionsGiven: number;
  suggestionsReceived: number;
  acceptanceRate: number;
}> {
  try {
    // Get posts count
    const postsResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM social_posts WHERE user_id = ?',
      args: [userId],
    });
    const postsCount = (postsResult.rows[0].count as number) || 0;

    // Get suggestions given
    const suggestionsGivenResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM social_suggestions WHERE suggested_by = ?',
      args: [userId],
    });
    const suggestionsGiven = (suggestionsGivenResult.rows[0].count as number) || 0;

    // Get suggestions received
    const suggestionsReceivedResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM social_suggestions WHERE suggested_to = ?',
      args: [userId],
    });
    const suggestionsReceived = (suggestionsReceivedResult.rows[0].count as number) || 0;

    // Get accepted suggestions count
    const acceptedResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM social_suggestions WHERE suggested_by = ? AND status = 'accepted'",
      args: [userId],
    });
    const acceptedCount = (acceptedResult.rows[0].count as number) || 0;

    // Calculate acceptance rate
    const acceptanceRate = suggestionsGiven > 0 ? (acceptedCount / suggestionsGiven) * 100 : 0;

    return {
      postsCount,
      suggestionsGiven,
      suggestionsReceived,
      acceptanceRate,
    };
  } catch (error) {
    console.error('[socialService:turso] Error fetching user stats:', error);
    throw error;
  }
}
