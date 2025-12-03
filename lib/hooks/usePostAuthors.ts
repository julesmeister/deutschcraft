import { useState, useEffect } from 'react';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import { getUser } from '@/lib/services/userService';

/**
 * Hook to fetch and cache user data for post authors
 */
export function usePostAuthors(posts: Post[], currentUser?: User) {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);

  // Store currentUser in state to include in results
  useEffect(() => {
    if (currentUser) {
      setUsers(prev => {
        // Only update if the user isn't already in state or if photoURL changed
        if (!prev[currentUser.userId] || prev[currentUser.userId].photoURL !== currentUser.photoURL) {
          return { ...prev, [currentUser.userId]: currentUser };
        }
        return prev;
      });
    }
  }, [currentUser?.userId, currentUser?.photoURL]);

  useEffect(() => {
    const fetchAuthors = async () => {
      if (posts.length === 0) {
        console.log('[usePostAuthors] No posts to fetch authors for');
        return;
      }

      console.log('[usePostAuthors] Fetching authors for', posts.length, 'posts');
      setLoading(true);
      const uniqueUserIds = [...new Set(posts.map(post => post.userId))];
      console.log('[usePostAuthors] Unique user IDs:', uniqueUserIds);
      const newUsers: Record<string, User> = {};

      // Fetch all users in parallel
      // Note: userId is the same as email in our system
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          // Skip if we already have this user
          if (users[userId]) {
            console.log('[usePostAuthors] Already have user:', userId);
            return;
          }

          try {
            console.log('[usePostAuthors] Fetching user:', userId);
            const userData = await getUser(userId);
            if (userData) {
              console.log('[usePostAuthors] Fetched user data:', {
                firstName: userData.firstName,
                lastName: userData.lastName,
                name: userData.name,
                email: userData.email,
                photoURL: userData.photoURL
              });

              // Ensure name field is populated (fallback to firstName + lastName)
              if (!userData.name && (userData.firstName || userData.lastName)) {
                userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                console.log('[usePostAuthors] Computed name from firstName/lastName:', userData.name);
              }

              newUsers[userId] = userData;
            } else {
              console.log('[usePostAuthors] No user data found for:', userId);
            }
          } catch (error) {
            console.error(`[usePostAuthors] Error fetching user ${userId}:`, error);
          }
        })
      );

      // Update users state with all newly fetched users
      if (Object.keys(newUsers).length > 0) {
        console.log('[usePostAuthors] Adding new users to state:', Object.keys(newUsers));
        setUsers(prev => ({ ...prev, ...newUsers }));
      } else {
        console.log('[usePostAuthors] No new users to add');
      }

      setLoading(false);
    };

    fetchAuthors();
  }, [posts]);

  return { users, loading };
}
