/**
 * Social Media Hooks
 * React hooks for social features with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Comment, Suggestion } from '@/lib/models/social';
import {
  createPost,
  updatePost,
  deletePost,
  createComment,
  createSuggestion,
  toggleLike,
  acceptSuggestion,
  voteSuggestion,
  getUserSocialStats,
} from '@/lib/services/socialService';

// ============================================================================
// POSTS HOOK
// ============================================================================

export function usePosts(filters?: {
  userId?: string;
  cefrLevel?: string;
  visibility?: string;
  limitCount?: number;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(filters?.limitCount || 20)
    );

    if (filters?.userId) {
      q = query(
        collection(db, 'posts'),
        where('userId', '==', filters.userId),
        orderBy('createdAt', 'desc'),
        limit(filters?.limitCount || 20)
      );
    }

    if (filters?.cefrLevel) {
      q = query(
        collection(db, 'posts'),
        where('cefrLevel', '==', filters.cefrLevel),
        orderBy('createdAt', 'desc'),
        limit(filters?.limitCount || 20)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map(doc => doc.data() as Post);
        setPosts(postsData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.userId, filters?.cefrLevel, filters?.visibility, filters?.limitCount]);

  const addPost = useCallback(async (postData: Omit<Post, 'postId' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'suggestionsCount' | 'sharesCount' | 'isEdited' | 'hasAcceptedSuggestion'>) => {
    try {
      const postId = await createPost(postData);
      return postId;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const editPost = useCallback(async (postId: string, updates: Partial<Post>) => {
    try {
      await updatePost(postId, { ...updates, isEdited: true });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const removePost = useCallback(async (postId: string) => {
    try {
      await deletePost(postId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    posts,
    loading,
    error,
    addPost,
    editPost,
    removePost,
  };
}

// ============================================================================
// COMMENTS HOOK
// ============================================================================

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => doc.data() as Comment);
        setComments(commentsData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const addComment = useCallback(async (commentData: Omit<Comment, 'commentId' | 'createdAt' | 'updatedAt' | 'likesCount'>) => {
    try {
      const commentId = await createComment(commentData);
      return commentId;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    comments,
    loading,
    error,
    addComment,
  };
}

// ============================================================================
// SUGGESTIONS HOOK
// ============================================================================

export function useSuggestions(postId: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'suggestions'),
      where('postId', '==', postId),
      orderBy('upvotes', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const suggestionsData = snapshot.docs.map(doc => doc.data() as Suggestion);
        setSuggestions(suggestionsData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const addSuggestion = useCallback(async (suggestionData: Omit<Suggestion, 'suggestionId' | 'createdAt' | 'updatedAt' | 'status' | 'upvotes' | 'downvotes'>) => {
    try {
      const suggestionId = await createSuggestion(suggestionData);
      return suggestionId;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const accept = useCallback(async (suggestionId: string) => {
    try {
      await acceptSuggestion(suggestionId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const vote = useCallback(async (suggestionId: string, voteType: 'up' | 'down') => {
    try {
      await voteSuggestion(suggestionId, voteType);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    addSuggestion,
    accept,
    vote,
  };
}

// ============================================================================
// LIKES HOOK
// ============================================================================

export function useLike(userId: string, targetId: string, targetType: 'post' | 'comment') {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const liked = await toggleLike(userId, targetId, targetType);
      setIsLiked(liked);
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, targetId, targetType]);

  return {
    isLiked,
    loading,
    toggle,
  };
}

// ============================================================================
// USER SOCIAL STATS HOOK
// ============================================================================

export function useUserSocialStats(userId: string) {
  const [stats, setStats] = useState({
    postsCount: 0,
    suggestionsGiven: 0,
    suggestionsReceived: 0,
    acceptanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const userStats = await getUserSocialStats(userId);
        setStats(userStats);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return {
    stats,
    loading,
    error,
  };
}
