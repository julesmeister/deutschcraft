'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/lib/hooks/useUsers';
import { usePosts, useUserSocialStats } from '@/lib/hooks/useSocial';
import { usePostAuthors } from '@/lib/hooks/usePostAuthors';
import { useTeacherBatches } from '@/lib/hooks/useBatches';
import { useBatchSelection } from '@/lib/hooks/useBatchSelection';
import { useDailyTheme } from '@/lib/hooks/useDailyTheme';
import PostCard from '@/components/social/PostCard';
import CreatePost from '@/components/social/CreatePost';
import ProfileSidebar from '@/components/social/ProfileSidebar';
import { DailyThemeEditor } from '@/components/social/DailyTheme';
import { ToastProvider } from '@/components/ui/toast';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import {
  LoadingSpinner,
  PostsLoadingSpinner,
  NoUserWarning,
  EmptyPostsState,
} from './LoadingStates';
import { TeachingImpact, CommonMistakes, TeachingTips } from './TeacherSidebar';
import { BatchFilterDropdown } from './BatchFilterDropdown';

export default function TeacherSocialPage() {
  const { data: session } = useSession();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser(session?.user?.email || null);
  const postFilters = useMemo(() => ({ limitCount: 20 }), []);
  const { posts, loading: postsLoading, addPost, refresh: refreshPosts } = usePosts(postFilters);

  const { stats } = useUserSocialStats(session?.user?.email || '');
  const { batches, loading: batchesLoading } = useTeacherBatches(session?.user?.email || null);

  const enrichedCurrentUser = useMemo(() => {
    if (!currentUser) return undefined;
    return {
      ...currentUser,
      photoURL: currentUser.photoURL || session?.user?.image || undefined
    };
  }, [currentUser?.userId, currentUser?.photoURL, session?.user?.image]);

  const { selectedBatch, setSelectedBatch, sortedBatches } = useBatchSelection({
    batches,
    user: enrichedCurrentUser
  });

  const filterBatch = selectedBatch ? selectedBatch.batchId : 'all';

  const { theme, loading: themeLoading, createTheme, updateTheme } = useDailyTheme(filterBatch === 'all' ? undefined : filterBatch);

  const { users } = usePostAuthors(posts, enrichedCurrentUser);

  const handleCreatePost = async (content: string, mediaUrls?: string[]) => {
    if (!enrichedCurrentUser) return;

    await addPost({
      userId: enrichedCurrentUser.userId,
      userEmail: enrichedCurrentUser.email,
      content,
      mediaUrls: mediaUrls || [],
      mediaType: mediaUrls && mediaUrls.length > 0 ? 'image' : 'none',
      cefrLevel: 'B2',
      visibility: 'public',
    });
  };

  const handleSaveTheme = async (title: string, description: string) => {
    if (!enrichedCurrentUser || filterBatch === 'all') return;

    if (theme) {
      await updateTheme(theme.themeId, { title, description });
    } else {
      await createTheme({
        batchId: filterBatch,
        title,
        description,
        createdBy: enrichedCurrentUser.userId,
      });
    }
  };

  const handleSuggestCorrection = (post: Post) => {
    console.log('Suggest correction for post:', post.postId);
  };

  const handleBatchChange = (value: string) => {
    if (value === 'all') {
      setSelectedBatch(null);
    } else {
      const batch = batches.find(b => b.batchId === value) || null;
      setSelectedBatch(batch);
    }
  };

  const filteredPosts = useMemo(() => {
    if (filterBatch === 'all') return posts;

    return posts.filter(post => {
      if (post.userId === enrichedCurrentUser?.userId) return true;

      const author = users[post.userId];
      if (!author) return false;

      return author.batchId === filterBatch;
    });
  }, [posts, filterBatch, users, enrichedCurrentUser?.userId]);

  const batchOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Batches' }];
    if (sortedBatches) {
      sortedBatches.forEach(batch => {
        options.push({
          value: batch.batchId,
          label: batch.name
        });
      });
    }
    return options;
  }, [sortedBatches]);

  if (userLoading) {
    return <LoadingSpinner />;
  }

  if (!enrichedCurrentUser) {
    return <NoUserWarning />;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-3">
            <ProfileSidebar
              user={enrichedCurrentUser}
              batchName={undefined}
              stats={{
                postsCount: stats.postsCount,
                followersCount: stats.suggestionsReceived,
                followingCount: stats.suggestionsGiven,
                suggestionsGiven: stats.suggestionsGiven,
                suggestionsReceived: stats.suggestionsReceived,
                acceptanceRate: stats.acceptanceRate,
              }}
            />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              <CreatePost
                currentUserId={enrichedCurrentUser.userId}
                userLevel="B2"
                currentUser={enrichedCurrentUser}
                onSubmit={handleCreatePost}
              />

              <BatchFilterDropdown
                filterBatch={filterBatch}
                batchOptions={batchOptions}
                onChange={handleBatchChange}
                variant="main"
              />

              {postsLoading ? (
                <PostsLoadingSpinner />
              ) : filteredPosts.length === 0 ? (
                <EmptyPostsState filterBatch={filterBatch} />
              ) : (
                filteredPosts.map(post => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    author={users[post.userId] || ({
                      userId: post.userId,
                      email: post.userEmail,
                      firstName: 'User',
                      lastName: '',
                      role: 'STUDENT',
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    } as User)}
                    currentUserId={enrichedCurrentUser.userId}
                    currentUser={enrichedCurrentUser}
                    onSuggest={() => handleSuggestCorrection(post)}
                    onPostUpdated={refreshPosts}
                  />
                ))
              )}

              {filteredPosts.length >= 20 && (
                <button className="w-full py-3 px-4 bg-white border border-gray-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
                  Load More Posts
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar - Teacher Insights */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <BatchFilterDropdown
                filterBatch={filterBatch}
                batchOptions={batchOptions}
                onChange={handleBatchChange}
                variant="sidebar"
              />

              {filterBatch !== 'all' && enrichedCurrentUser && (
                <DailyThemeEditor
                  theme={theme}
                  batchId={filterBatch}
                  teacherId={enrichedCurrentUser.userId}
                  onSave={handleSaveTheme}
                />
              )}

              <TeachingImpact stats={stats} />
              <CommonMistakes />
              <TeachingTips />
            </div>
          </div>
        </div>
      </div>
    </div>
    </ToastProvider>
  );
}
