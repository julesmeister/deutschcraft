/**
 * Social Media Service
 * Handles all Firestore operations for posts, comments, suggestions, etc.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Comment, Suggestion, Like, Share, Poll, PollVote } from '@/lib/models/social';

// ============================================================================
// POSTS
// ============================================================================

export async function createPost(postData: Omit<Post, 'postId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const postRef = doc(collection(db, 'posts'));
  const postId = postRef.id;

  const newPost: Post = {
    ...postData,
    postId,
    likesCount: 0,
    commentsCount: 0,
    suggestionsCount: 0,
    sharesCount: 0,
    isEdited: false,
    hasAcceptedSuggestion: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(postRef, newPost);
  return postId;
}

export async function getPost(postId: string): Promise<Post | null> {
  const postDoc = await getDoc(doc(db, 'posts', postId));
  return postDoc.exists() ? (postDoc.data() as Post) : null;
}

export async function getPosts(
  filters?: {
    userId?: string;
    cefrLevel?: string;
    visibility?: string;
  },
  limitCount: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));

  if (filters?.userId) {
    q = query(collection(db, 'posts'), where('userId', '==', filters.userId), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  if (filters?.cefrLevel) {
    q = query(collection(db, 'posts'), where('cefrLevel', '==', filters.cefrLevel), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  if (filters?.visibility) {
    q = query(collection(db, 'posts'), where('visibility', '==', filters.visibility), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => doc.data() as Post);
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', postId));
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function createComment(commentData: Omit<Comment, 'commentId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const commentRef = doc(collection(db, 'comments'));
  const commentId = commentRef.id;

  const newComment: Comment = {
    ...commentData,
    commentId,
    likesCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const batch = writeBatch(db);

  // Create comment
  batch.set(commentRef, newComment);

  // Increment post comment count
  const postRef = doc(db, 'posts', commentData.postId);
  batch.update(postRef, {
    commentsCount: increment(1),
  });

  await batch.commit();
  return commentId;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Comment);
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete comment
  batch.delete(doc(db, 'comments', commentId));

  // Decrement post comment count
  const postRef = doc(db, 'posts', postId);
  batch.update(postRef, {
    commentsCount: increment(-1),
  });

  await batch.commit();
}

// ============================================================================
// SUGGESTIONS
// ============================================================================

export async function createSuggestion(suggestionData: Omit<Suggestion, 'suggestionId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const suggestionRef = doc(collection(db, 'suggestions'));
  const suggestionId = suggestionRef.id;

  const newSuggestion: Suggestion = {
    ...suggestionData,
    suggestionId,
    status: 'pending',
    upvotes: 0,
    downvotes: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const batch = writeBatch(db);

  // Create suggestion
  batch.set(suggestionRef, newSuggestion);

  // Increment post suggestion count
  const postRef = doc(db, 'posts', suggestionData.postId);
  batch.update(postRef, {
    suggestionsCount: increment(1),
  });

  await batch.commit();
  return suggestionId;
}

export async function getSuggestions(postId: string): Promise<Suggestion[]> {
  const q = query(
    collection(db, 'suggestions'),
    where('postId', '==', postId),
    orderBy('upvotes', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Suggestion);
}

export async function updateSuggestion(suggestionId: string, updates: Partial<Suggestion>): Promise<void> {
  const suggestionRef = doc(db, 'suggestions', suggestionId);
  await updateDoc(suggestionRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function acceptSuggestion(suggestionId: string): Promise<void> {
  // Get suggestion data first (before any updates)
  const suggestionRef = doc(db, 'suggestions', suggestionId);
  const suggestionDoc = await getDoc(suggestionRef);

  if (!suggestionDoc.exists()) {
    throw new Error('Suggestion not found');
  }

  const suggestion = suggestionDoc.data() as Suggestion;
  const postRef = doc(db, 'posts', suggestion.postId);

  // Get current post content
  const postDoc = await getDoc(postRef);
  if (!postDoc.exists()) {
    throw new Error('Post not found');
  }

  const post = postDoc.data();
  const currentContent = post.content || '';

  // Determine updated content
  let updatedContent: string;

  // If original text matches entire post content, replace entirely
  if (suggestion.originalText === currentContent) {
    updatedContent = suggestion.suggestedText;
    console.log('Replacing entire post content');
  } else if (currentContent.includes(suggestion.originalText)) {
    // If original text is found within content, replace that part
    updatedContent = currentContent.replace(
      suggestion.originalText,
      suggestion.suggestedText
    );
    console.log('Replacing matched portion');
  } else {
    // Original text not found - this shouldn't happen but handle gracefully
    console.warn('Original text not found, using suggested text as full replacement');
    updatedContent = suggestion.suggestedText;
  }

  console.log('Accepting suggestion:', {
    original: suggestion.originalText,
    suggested: suggestion.suggestedText,
    currentContent,
    updatedContent,
    changed: currentContent !== updatedContent
  });

  // Now perform batch update
  const batch = writeBatch(db);
  const now = Date.now();

  // Update suggestion status
  batch.update(suggestionRef, {
    status: 'accepted',
    acceptedAt: now,
    updatedAt: now,
  });

  // Update post with corrected content
  batch.update(postRef, {
    content: updatedContent,
    hasAcceptedSuggestion: true,
    isEdited: true,
    updatedAt: now,
  });

  await batch.commit();
}

export async function voteSuggestion(suggestionId: string, vote: 'up' | 'down'): Promise<void> {
  const suggestionRef = doc(db, 'suggestions', suggestionId);
  await updateDoc(suggestionRef, {
    [vote === 'up' ? 'upvotes' : 'downvotes']: increment(1),
  });
}

// ============================================================================
// LIKES
// ============================================================================

export async function toggleLike(userId: string, targetId: string, targetType: 'post' | 'comment'): Promise<boolean> {
  const likeId = `${userId}_${targetId}`;
  const likeRef = doc(db, 'likes', likeId);
  const likeDoc = await getDoc(likeRef);

  const batch = writeBatch(db);

  if (likeDoc.exists()) {
    // Unlike
    batch.delete(likeRef);

    const targetRef = doc(db, targetType === 'post' ? 'posts' : 'comments', targetId);
    batch.update(targetRef, {
      likesCount: increment(-1),
    });

    await batch.commit();
    return false;
  } else {
    // Like
    const newLike: Like = {
      likeId,
      userId,
      targetId,
      targetType,
      createdAt: Date.now(),
    };

    batch.set(likeRef, newLike);

    const targetRef = doc(db, targetType === 'post' ? 'posts' : 'comments', targetId);
    batch.update(targetRef, {
      likesCount: increment(1),
    });

    await batch.commit();
    return true;
  }
}

export async function hasUserLiked(userId: string, targetId: string): Promise<boolean> {
  const likeId = `${userId}_${targetId}`;
  const likeDoc = await getDoc(doc(db, 'likes', likeId));
  return likeDoc.exists();
}

// ============================================================================
// SHARES
// ============================================================================

export async function sharePost(shareData: Omit<Share, 'shareId' | 'createdAt'>): Promise<string> {
  const shareRef = doc(collection(db, 'shares'));
  const shareId = shareRef.id;

  const newShare: Share = {
    ...shareData,
    shareId,
    createdAt: Date.now(),
  };

  const batch = writeBatch(db);

  // Create share
  batch.set(shareRef, newShare);

  // Increment post share count
  const postRef = doc(db, 'posts', shareData.postId);
  batch.update(postRef, {
    sharesCount: increment(1),
  });

  await batch.commit();
  return shareId;
}

// ============================================================================
// POLLS
// ============================================================================

export async function votePoll(pollVote: Omit<PollVote, 'voteId' | 'createdAt'>): Promise<string> {
  const voteRef = doc(collection(db, 'pollVotes'));
  const voteId = voteRef.id;

  const newVote: PollVote = {
    ...pollVote,
    voteId,
    createdAt: Date.now(),
  };

  await setDoc(voteRef, newVote);
  return voteId;
}

export async function getPollVotes(pollId: string): Promise<PollVote[]> {
  const q = query(collection(db, 'pollVotes'), where('pollId', '==', pollId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PollVote);
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
  // Get posts count
  const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
  const postsSnapshot = await getDocs(postsQuery);
  const postsCount = postsSnapshot.size;

  // Get suggestions given
  const suggestionsGivenQuery = query(collection(db, 'suggestions'), where('suggestedBy', '==', userId));
  const suggestionsGivenSnapshot = await getDocs(suggestionsGivenQuery);
  const suggestionsGiven = suggestionsGivenSnapshot.size;

  // Get suggestions received
  const suggestionsReceivedQuery = query(collection(db, 'suggestions'), where('suggestedTo', '==', userId));
  const suggestionsReceivedSnapshot = await getDocs(suggestionsReceivedQuery);
  const suggestionsReceived = suggestionsReceivedSnapshot.size;

  // Calculate acceptance rate
  const acceptedSuggestions = suggestionsGivenSnapshot.docs.filter(
    doc => (doc.data() as Suggestion).status === 'accepted'
  ).length;
  const acceptanceRate = suggestionsGiven > 0 ? (acceptedSuggestions / suggestionsGiven) * 100 : 0;

  return {
    postsCount,
    suggestionsGiven,
    suggestionsReceived,
    acceptanceRate,
  };
}
