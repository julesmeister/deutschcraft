'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { usePosts, useUserSocialStats } from '@/lib/hooks/useSocial';
import { useBatch } from '@/lib/hooks/useBatches';
import { usePostAuthors } from '@/lib/hooks/usePostAuthors';
import PostCard from '@/components/social/PostCard';
import CreatePost from '@/components/social/CreatePost';
import ProfileSidebar from '@/components/social/ProfileSidebar';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';

export default function StudentSocialPage() {
  const { data: session } = useSession();
  const { student: currentUser, loading: userLoading } = useCurrentStudent(session?.user?.email || null);
  const { posts, loading: postsLoading, addPost, refresh: refreshPosts } = usePosts({ limitCount: 20 });
  const { stats } = useUserSocialStats(session?.user?.email || '');
  const { batch } = useBatch(currentUser?.batchId || undefined);
  const [postFilter, setPostFilter] = useState<'all' | 'batch'>('all');

  // Ensure currentUser has photoURL from session if missing (memoized to prevent infinite loops)
  const enrichedCurrentUser = useMemo(() => {
    if (!currentUser) return undefined;
    return {
      ...currentUser,
      photoURL: currentUser.photoURL || session?.user?.image || undefined
    };
  }, [currentUser?.userId, currentUser?.photoURL, session?.user?.image]);

  const { users } = usePostAuthors(posts, enrichedCurrentUser);

  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    if (postFilter === 'all') {
      return posts;
    }
    // Filter to only show posts from users in the same batch
    return posts.filter(post => {
      const postAuthor = users[post.userId];
      return postAuthor && postAuthor.batchId === currentUser?.batchId;
    });
  }, [posts, postFilter, users, currentUser?.batchId]);

  const handleCreatePost = async (content: string, mediaUrls?: string[]) => {
    if (!enrichedCurrentUser) return;

    await addPost({
      userId: enrichedCurrentUser.userId,
      userEmail: enrichedCurrentUser.email,
      content,
      mediaUrls: mediaUrls || [],
      mediaType: mediaUrls && mediaUrls.length > 0 ? 'image' : 'none',
      cefrLevel: enrichedCurrentUser.cefrLevel || 'A1',
      visibility: 'public',
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-3">
            <ProfileSidebar
              user={enrichedCurrentUser}
              batchName={batch?.name}
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
                userLevel={enrichedCurrentUser.cefrLevel || 'A1'}
                currentUser={enrichedCurrentUser}
                onSubmit={handleCreatePost}
              />

              {/* Posts Feed */}
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 text-center">
                  <h5 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h5>
                  <p className="text-gray-500">
                    {postFilter === 'batch'
                      ? 'No posts from your batch yet. Try viewing all posts or create the first post!'
                      : 'Be the first to share something in German!'}
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

          {/* Right Sidebar - Filter & Tips */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Filter */}
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Filter Posts</h5>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => setPostFilter('all')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        postFilter === 'all'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                        </svg>
                        <span className="text-sm font-medium">Everyone</span>
                      </div>
                      {postFilter === 'all' && (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setPostFilter('batch')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        postFilter === 'batch'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                        </svg>
                        <span className="text-sm font-medium">My Batch</span>
                      </div>
                      {postFilter === 'batch' && (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {batch && postFilter === 'batch' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Showing posts from <span className="font-semibold text-gray-700">{batch.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Quick Tips</h5>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">✍️</span>
                      <span>Write posts in German to practice</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">💡</span>
                      <span>Suggest corrections to help classmates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✅</span>
                      <span>Accept suggestions to improve</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📈</span>
                      <span>Track your progress over time</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
