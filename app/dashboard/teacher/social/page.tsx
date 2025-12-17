'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/lib/hooks/useUsers';
import { usePosts, useUserSocialStats } from '@/lib/hooks/useSocial';
import { usePostAuthors } from '@/lib/hooks/usePostAuthors';
import { useTeacherBatches } from '@/lib/hooks/useBatches';
import { useDailyTheme } from '@/lib/hooks/useDailyTheme';
import PostCard from '@/components/social/PostCard';
import CreatePost from '@/components/social/CreatePost';
import ProfileSidebar from '@/components/social/ProfileSidebar';
import { DailyThemeEditor } from '@/components/social/DailyTheme';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import { ToastProvider } from '@/components/ui/toast';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';

export default function TeacherSocialPage() {
  const { data: session } = useSession();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser(session?.user?.email || null);
  const { posts, loading: postsLoading, addPost, refresh: refreshPosts } = usePosts({ limitCount: 20 });
  const { stats } = useUserSocialStats(session?.user?.email || '');
  const { batches, loading: batchesLoading } = useTeacherBatches(session?.user?.email || null);

  // State must be declared before it's used in hooks
  // Load from localStorage on mount
  const [filterBatch, setFilterBatch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('teacher-social-batch-filter') || 'all';
    }
    return 'all';
  });
  const { theme, loading: themeLoading, createTheme, updateTheme } = useDailyTheme(filterBatch === 'all' ? undefined : filterBatch);

  // Save to localStorage whenever filterBatch changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('teacher-social-batch-filter', filterBatch);
    }
  }, [filterBatch]);

  // Ensure currentUser has photoURL from session if missing (memoized to prevent infinite loops)
  const enrichedCurrentUser = useMemo(() => {
    if (!currentUser) return undefined;
    return {
      ...currentUser,
      photoURL: currentUser.photoURL || session?.user?.image || undefined
    };
  }, [currentUser?.userId, currentUser?.photoURL, session?.user?.image]);

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
      // Update existing theme
      await updateTheme(theme.themeId, { title, description });
    } else {
      // Create new theme
      await createTheme({
        batchId: filterBatch,
        title,
        description,
        createdBy: enrichedCurrentUser.userId,
      });
    }
  };

  const handleSuggestCorrection = (post: Post) => {
    // Placeholder for suggestion functionality
    console.log('Suggest correction for post:', post.postId);
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!enrichedCurrentUser) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please complete your profile to access social features.</p>
      </div>
    );
  }

  // Filter posts by batch (filter by student's batchId)
  const filteredPosts = useMemo(() => {
    if (filterBatch === 'all') return posts;

    // Filter posts where the author's batchId matches the selected batch
    return posts.filter(post => {
      const author = users[post.userId];
      return author?.batchId === filterBatch;
    });
  }, [posts, filterBatch, users]);

  // Create dropdown options from batches
  const batchOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Batches' }];
    if (batches) {
      batches.forEach(batch => {
        options.push({
          value: batch.batchId,
          label: batch.name
        });
      });
    }
    return options;
  }, [batches]);

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
              {/* Create Post */}
              <CreatePost
                currentUserId={enrichedCurrentUser.userId}
                userLevel="B2"
                currentUser={enrichedCurrentUser}
                onSubmit={handleCreatePost}
              />

              {/* Filter by Batch - Compact */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">Filter by Batch:</span>
                <CompactButtonDropdown
                  label={batchOptions.find(opt => opt.value === filterBatch)?.label || 'All Batches'}
                  icon={<span>📚</span>}
                  options={batchOptions}
                  value={filterBatch}
                  onChange={(value) => setFilterBatch(value as string)}
                  buttonClassName="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                />
              </div>

              {/* Posts Feed */}
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 text-center">
                  <h5 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h5>
                  <p className="text-gray-500">
                    {filterBatch === 'all'
                      ? 'Be the first to share something in German!'
                      : `No posts found for the selected batch.`}
                  </p>
                </div>
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

              {/* Load More */}
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
              {/* Batch Selector - Compact */}
              <div className="bg-white border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900 text-sm">Select Batch</h5>
                </div>
                <div className="p-3">
                  <CompactButtonDropdown
                    label={batchOptions.find(opt => opt.value === filterBatch)?.label || 'All Batches'}
                    icon={<span>📚</span>}
                    options={batchOptions}
                    value={filterBatch}
                    onChange={(value) => setFilterBatch(value as string)}
                    buttonClassName="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  />
                </div>
              </div>

              {/* Daily Theme Editor */}
              {filterBatch !== 'all' && enrichedCurrentUser && (
                <DailyThemeEditor
                  theme={theme}
                  batchId={filterBatch}
                  teacherId={enrichedCurrentUser.userId}
                  onSave={handleSaveTheme}
                />
              )}

              {/* Teaching Impact */}
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Your Teaching Impact</h5>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Posts Created:</span>
                    <strong className="text-blue-600">{stats.postsCount}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Corrections Given:</span>
                    <strong className="text-green-600">{stats.suggestionsGiven}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Corrections Received:</span>
                    <strong className="text-cyan-600">{stats.suggestionsReceived}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acceptance Rate:</span>
                    <strong className="text-amber-600">{stats.acceptanceRate.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              {/* Common Mistakes */}
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Common Mistakes</h5>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Track patterns across student posts to identify areas needing focus.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Article usage (der/die/das)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-red-600 h-1 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Verb conjugation</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-amber-600 h-1 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Word order</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-cyan-600 h-1 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teaching Tips */}
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Teaching Tips</h5>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">👨‍🏫</span>
                      <span>Focus on constructive feedback</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📚</span>
                      <span>Reference grammar rules in suggestions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎯</span>
                      <span>Prioritize common error patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">💬</span>
                      <span>Encourage peer-to-peer learning</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ToastProvider>
  );
}
