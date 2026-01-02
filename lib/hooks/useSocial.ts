/**
 * Social Media Hooks
 * React hooks for social features with real-time updates
 *
 * NOTE: This hook uses the useSocialService abstraction layer,
 * which allows switching between Firebase and Turso via environment variables.
 */

import { useState, useEffect, useCallback } from "react";
import { Post, Comment, Suggestion } from "@/lib/models/social";
import {
  useSocialService,
  getSocialServiceProvider,
} from "@/lib/hooks/useSocialService";

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
  const {
    getPosts: fetchPosts,
    createPost,
    updatePost,
    deletePost,
    isUsingTurso,
  } = useSocialService();

  const loadPosts = useCallback(
    async (silent = false) => {
      try {
        if (!silent) console.log("[usePosts] Loading posts...");
        if (!silent) setLoading(true);
        const { posts: postsData } = await fetchPosts(
          {
            userId: filters?.userId,
            cefrLevel: filters?.cefrLevel,
            visibility: filters?.visibility,
          },
          filters?.limitCount || 20,
          0
        );
        if (!silent)
          console.log("[usePosts] Loaded", postsData.length, "posts");
        if (postsData.length > 0 && !silent) {
          console.log("[usePosts] First post content:", postsData[0].content);
        }
        setPosts((prev) => {
          // Prevent unnecessary updates if data hasn't changed
          if (JSON.stringify(prev) === JSON.stringify(postsData)) return prev;
          return postsData;
        });
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [
      filters?.userId,
      filters?.cefrLevel,
      filters?.visibility,
      filters?.limitCount,
    ]
  );

  useEffect(() => {
    loadPosts();

    // If using Turso, set up polling (no real-time updates)
    // If using Firebase, could implement onSnapshot here
    if (isUsingTurso) {
      const interval = setInterval(() => loadPosts(true), 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [loadPosts, isUsingTurso]);

  const addPost = useCallback(
    async (
      postData: Omit<
        Post,
        | "postId"
        | "createdAt"
        | "updatedAt"
        | "likesCount"
        | "commentsCount"
        | "suggestionsCount"
        | "sharesCount"
        | "isEdited"
        | "hasAcceptedSuggestion"
      >
    ) => {
      try {
        const postId = await createPost(postData);
        // Refresh posts after adding
        await loadPosts();
        return postId;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [createPost, loadPosts]
  );

  const editPost = useCallback(
    async (postId: string, updates: Partial<Post>) => {
      try {
        await updatePost(postId, { ...updates, isEdited: true });
        // Refresh posts after updating
        await loadPosts();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [updatePost, loadPosts]
  );

  const removePost = useCallback(
    async (postId: string) => {
      try {
        await deletePost(postId);
        // Refresh posts after deleting
        await loadPosts();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [deletePost, loadPosts]
  );

  return {
    posts,
    loading,
    error,
    addPost,
    editPost,
    removePost,
    refresh: loadPosts,
  };
}

// ============================================================================
// COMMENTS HOOK
// ============================================================================

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const {
    getComments: fetchComments,
    createComment,
    isUsingTurso,
  } = useSocialService();

  const loadComments = useCallback(
    async (silent = false) => {
      if (!postId) return;

      try {
        if (!silent) {
          setLoading(true);
        }
        const commentsData = await fetchComments(postId);

        setComments((prev) => {
          // Prevent unnecessary updates if data hasn't changed
          if (JSON.stringify(prev) === JSON.stringify(commentsData)) {
            return prev;
          }
          return commentsData;
        });
        setLoading(false);
      } catch (err) {
        console.error("[useComments] Error loading comments:", err);
        setError(err as Error);
        setLoading(false);
      }
    },
    [postId, fetchComments]
  );

  useEffect(() => {
    loadComments();

    // If using Turso, set up polling
    if (isUsingTurso) {
      const interval = setInterval(() => loadComments(true), 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [loadComments, isUsingTurso]);

  const addComment = useCallback(
    async (
      commentData: Omit<
        Comment,
        "commentId" | "createdAt" | "updatedAt" | "likesCount"
      >
    ) => {
      try {
        const commentId = await createComment(commentData);
        // Refresh comments after adding
        await loadComments();
        return commentId;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [createComment, loadComments]
  );

  return {
    comments,
    loading,
    error,
    addComment,
    refresh: loadComments,
  };
}

// ============================================================================
// SUGGESTIONS HOOK
// ============================================================================

export function useSuggestions(postId: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const {
    getSuggestions: fetchSuggestions,
    createSuggestion,
    acceptSuggestion,
    voteSuggestion,
    isUsingTurso,
  } = useSocialService();

  const loadSuggestions = useCallback(
    async (silent = false) => {
      if (!postId) return;

      try {
        if (!silent) setLoading(true);
        const suggestionsData = await fetchSuggestions(postId);
        setSuggestions((prev) => {
          // Prevent unnecessary updates if data hasn't changed
          if (JSON.stringify(prev) === JSON.stringify(suggestionsData))
            return prev;
          return suggestionsData;
        });
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [postId, fetchSuggestions]
  );

  useEffect(() => {
    loadSuggestions();

    // If using Turso, set up polling
    if (isUsingTurso) {
      const interval = setInterval(() => loadSuggestions(true), 20000); // Poll every 20 seconds
      return () => clearInterval(interval);
    }
  }, [loadSuggestions, isUsingTurso]);

  const addSuggestion = useCallback(
    async (
      suggestionData: Omit<
        Suggestion,
        | "suggestionId"
        | "createdAt"
        | "updatedAt"
        | "status"
        | "upvotes"
        | "downvotes"
      >
    ) => {
      try {
        const suggestionId = await createSuggestion(suggestionData);
        // Refresh suggestions after adding
        await loadSuggestions();
        return suggestionId;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [createSuggestion, loadSuggestions]
  );

  const accept = useCallback(
    async (suggestionId: string) => {
      try {
        await acceptSuggestion(suggestionId);
        // Refresh suggestions after accepting
        await loadSuggestions();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [acceptSuggestion, loadSuggestions]
  );

  const vote = useCallback(
    async (suggestionId: string, voteType: "up" | "down") => {
      try {
        await voteSuggestion(suggestionId, voteType);
        // Refresh suggestions after voting
        await loadSuggestions();
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [voteSuggestion, loadSuggestions]
  );

  return {
    suggestions,
    loading,
    error,
    addSuggestion,
    accept,
    vote,
    refresh: loadSuggestions,
  };
}

// ============================================================================
// LIKES HOOK
// ============================================================================

export function useLike(
  userId: string,
  targetId: string,
  targetType: "post" | "comment"
) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toggleLike } = useSocialService();

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const liked = await toggleLike(userId, targetId, targetType);
      setIsLiked(liked);
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, targetId, targetType, toggleLike]);

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
  const { getUserSocialStats } = useSocialService();

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
  }, [userId, getUserSocialStats]);

  return {
    stats,
    loading,
    error,
  };
}
