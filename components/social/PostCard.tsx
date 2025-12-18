'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/Dialog';
import PostHeader from './PostHeader';
import PostActions from './PostActions';
import PostMedia from './PostMedia';
import CommentSection from './CommentSection';
import SuggestionForm from './SuggestionForm';
import SuggestionsList from './SuggestionsList';

interface PostCardProps {
  post: Post;
  author: User;
  currentUserId: string;
  currentUser?: User;
  onLike?: () => void;
  onComment?: () => void;
  onSuggest?: () => void;
  onShare?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({
  post,
  author,
  currentUserId,
  currentUser,
  onLike,
  onComment,
  onSuggest,
  onShare,
  onPostUpdated
}: PostCardProps) {
  const [showComments, setShowComments] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [displayContent, setDisplayContent] = useState(post.content);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [likeStatusLoaded, setLikeStatusLoaded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toggleLike, hasUserLiked, deletePost } = useSocialService();
  const toast = useToast();

  const isAuthor = currentUserId === post.userId;

  // Load initial like status
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const liked = await hasUserLiked(currentUserId, post.postId);
        setIsLiked(liked);
        setLikeStatusLoaded(true);
      } catch (error) {
        console.error('Error loading like status:', error);
        setLikeStatusLoaded(true);
      }
    };

    if (currentUserId && post.postId) {
      loadLikeStatus();
    }
  }, [currentUserId, post.postId]);

  const handleLike = async () => {
    try {
      const nowLiked = await toggleLike(currentUserId, post.postId, 'post');
      setIsLiked(nowLiked);
      setLikeCount(prev => nowLiked ? prev + 1 : prev - 1);

      // Show success toast
      if (nowLiked) {
        toast.success('Post liked!', { duration: 2000 });
      }

      if (onLike) {
        onLike();
      }
    } catch (err) {
      toast.error('Failed to like post', { duration: 2000 });
      console.error('Error liking post:', err);
    }
  };

  const handleSuggestionCreated = () => {
    setShowSuggestionForm(false);
    toast.success('Correction submitted!', { duration: 3000 });
  };

  const handleSuggestionAccepted = (correctedText: string) => {
    // Update the displayed content with the accepted correction
    setDisplayContent(correctedText);
    toast.success('Correction applied to post!', { duration: 3000 });
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.postId);
      toast.success('Post deleted successfully', { duration: 2000 });
      setShowDeleteDialog(false);
      // Refresh the posts list
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post', { duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200">
        {/* Header */}
        <div className="px-4 pt-4 pb-0">
          <PostHeader
            author={author}
            cefrLevel={post.cefrLevel}
            createdAt={post.createdAt}
            isEdited={post.isEdited}
            currentUserId={currentUserId}
            currentUserRole={currentUser?.role}
            postId={post.postId}
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3">
        <p className="text-gray-700 mb-3">{displayContent}</p>

        {/* Suggestions List */}
        <SuggestionsList
          postId={post.postId}
          suggestionsCount={post.suggestionsCount}
          isAuthor={isAuthor}
          currentUser={currentUser}
          onSuggestionAccepted={handleSuggestionAccepted}
          onAcceptedSuggestionLoaded={setDisplayContent}
        />

        {/* Suggestion Form - Inline */}
        {showSuggestionForm && (
          <SuggestionForm
            postId={post.postId}
            postContent={post.content}
            postUserId={post.userId}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onClose={() => setShowSuggestionForm(false)}
            onSuggestionCreated={handleSuggestionCreated}
          />
        )}

        {/* Grammar Focus Tags */}
        {post.grammarFocus && post.grammarFocus.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.grammarFocus.map((focus, index) => (
              <span key={index} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded">
                {focus}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <PostMedia urls={post.mediaUrls} type={post.mediaType} />
        )}

        {/* Actions */}
        <PostActions
          postId={post.postId}
          currentUserId={currentUserId}
          authorId={post.userId}
          onLike={handleLike}
          onComment={onComment}
          onSuggest={() => setShowSuggestionForm(!showSuggestionForm)}
          onShare={onShare}
          onToggleComments={() => setShowComments(!showComments)}
          onToggleSuggestions={() => setShowSuggestionForm(!showSuggestionForm)}
          isLiked={isLiked}
          likeCount={likeCount}
        />

        {/* Comments Section */}
        <CommentSection
          postId={post.postId}
          currentUserId={currentUserId}
          currentUser={currentUser}
          isExpanded={showComments}
        />
      </div>
    </div>

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      open={showDeleteDialog}
      onClose={() => setShowDeleteDialog(false)}
      onConfirm={handleDeletePost}
      title="Delete Post"
      message="Are you sure you want to delete this post? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
    </>
  );
}
