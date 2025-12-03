/**
 * Social Service Hook - Abstraction Layer
 *
 * This hook provides a centralized way to access social media services.
 * Switch between Firebase and Turso by changing the DATABASE_PROVIDER
 * environment variable or by modifying the import below.
 *
 * Usage:
 * const { createPost, getPosts, createComment } = useSocialService();
 */

'use client';

import { useState, useCallback } from 'react';
import { Post, Comment, Suggestion, Like, Share } from '@/lib/models/social';

// ============================================================================
// CONFIGURATION - Switch between Firebase and Turso here
// ============================================================================

const USE_TURSO = process.env.NEXT_PUBLIC_DATABASE_PROVIDER === 'turso';

// Dynamic imports based on configuration
const getService = () => {
  if (USE_TURSO) {
    return import('@/lib/services/turso');
  } else {
    return import('@/lib/services/socialService');
  }
};

// ============================================================================
// HOOK
// ============================================================================

export function useSocialService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================================================
  // POSTS
  // ============================================================================

  const createPost = useCallback(async (postData: Omit<Post, 'postId' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const postId = await service.createPost(postData);
      return postId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create post');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const post = await service.getPost(postId);
      return post;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get post');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPosts = useCallback(async (
    filters?: { userId?: string; cefrLevel?: string; visibility?: string },
    limitCount?: number,
    offset?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();

      if (USE_TURSO) {
        // Turso uses offset-based pagination
        const posts = await service.getPosts(filters, limitCount, offset);
        return { posts, lastDoc: null };
      } else {
        // Firebase uses cursor-based pagination
        const result = await service.getPosts(filters, limitCount);
        return result;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get posts');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (postId: string, updates: Partial<Post>) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      await service.updatePost(postId, updates);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update post');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      await service.deletePost(postId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete post');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // COMMENTS
  // ============================================================================

  const createComment = useCallback(async (commentData: Omit<Comment, 'commentId' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const commentId = await service.createComment(commentData);
      return commentId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create comment');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComments = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const comments = await service.getComments(postId);
      return comments;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get comments');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string, postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      await service.deleteComment(commentId, postId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete comment');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // SUGGESTIONS
  // ============================================================================

  const createSuggestion = useCallback(async (suggestionData: Omit<Suggestion, 'suggestionId' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const suggestionId = await service.createSuggestion(suggestionData);
      return suggestionId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create suggestion');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const suggestions = await service.getSuggestions(postId);
      return suggestions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get suggestions');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSuggestion = useCallback(async (suggestionId: string, updates: Partial<Suggestion>) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      await service.updateSuggestion(suggestionId, updates);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update suggestion');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      await service.acceptSuggestion(suggestionId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to accept suggestion');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const voteSuggestion = useCallback(async (suggestionId: string, vote: 'up' | 'down') => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      await service.voteSuggestion(suggestionId, vote);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to vote on suggestion');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // LIKES
  // ============================================================================

  const toggleLike = useCallback(async (userId: string, targetId: string, targetType: 'post' | 'comment') => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const isLiked = await service.toggleLike(userId, targetId, targetType);
      return isLiked;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle like');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const hasUserLiked = useCallback(async (userId: string, targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const hasLiked = await service.hasUserLiked(userId, targetId);
      return hasLiked;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check like status');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // SHARES
  // ============================================================================

  const sharePost = useCallback(async (shareData: Omit<Share, 'shareId' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const shareId = await service.sharePost(shareData);
      return shareId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to share post');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // USER STATS
  // ============================================================================

  const getUserSocialStats = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await getService();
      const stats = await service.getUserSocialStats(userId);
      return stats;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get user stats');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    loading,
    error,
    isUsingTurso: USE_TURSO,

    // Posts
    createPost,
    getPost,
    getPosts,
    updatePost,
    deletePost,

    // Comments
    createComment,
    getComments,
    deleteComment,

    // Suggestions
    createSuggestion,
    getSuggestions,
    updateSuggestion,
    acceptSuggestion,
    voteSuggestion,

    // Likes
    toggleLike,
    hasUserLiked,

    // Shares
    sharePost,

    // Stats
    getUserSocialStats,
  };
}

// ============================================================================
// UTILITY: Get current provider
// ============================================================================

export function getSocialServiceProvider(): 'turso' | 'firebase' {
  return USE_TURSO ? 'turso' : 'firebase';
}
