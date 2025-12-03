'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { usePosts, useUserSocialStats } from '@/lib/hooks/useSocial';
import { useBatch } from '@/lib/hooks/useBatches';
import { usePostAuthors } from '@/lib/hooks/usePostAuthors';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { useWritingStats } from '@/lib/hooks/useWritingExercises';
import PostCard from '@/components/social/PostCard';
import CreatePost from '@/components/social/CreatePost';
import ProfileSidebar from '@/components/social/ProfileSidebar';
import PostFilter from '@/components/social/PostFilter';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';

export default function StudentSocialPage() {
  const { data: session } = useSession();
  const { student: currentUser, loading: userLoading } = useCurrentStudent(session?.user?.email || null);
  const { posts, loading: postsLoading, addPost, refresh: refreshPosts } = usePosts({ limitCount: 20 });
  const { stats } = useUserSocialStats(session?.user?.email || '');
  const { batch } = useBatch(currentUser?.batchId || undefined);
  const [postFilter, setPostFilter] = useState<'all' | 'batch'>('all');

  // Get comprehensive study stats
  const { stats: studyStats } = useStudyStats(session?.user?.email || undefined);
  const { data: writingStats } = useWritingStats(session?.user?.email || undefined);

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
          <div className="lg:col-span-3 animate-fade-in-up animation-delay-100">
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
                cardsLearned: studyStats.cardsLearned,
                cardsMastered: studyStats.cardsMastered,
                streak: studyStats.streak,
                writingExercises: writingStats?.totalExercisesCompleted || 0,
                wordsWritten: writingStats?.totalWordsWritten || 0,
              }}
            />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 animate-fade-in-up animation-delay-200">
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
                filteredPosts.map((post, index) => (
                  <div
                    key={post.postId}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PostCard
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
                  </div>
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
          <div className="lg:col-span-3 animate-fade-in-up animation-delay-300">
            <div className="space-y-6">
              {/* Filter */}
              <PostFilter
                filter={postFilter}
                onFilterChange={setPostFilter}
                batch={batch}
              />

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
