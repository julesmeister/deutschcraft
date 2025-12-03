'use client';

import { User } from '@/lib/models/user';

interface UserAvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStory?: boolean;
  className?: string;
}

export default function UserAvatar({
  user,
  size = 'md',
  hasStory = false,
  className = ''
}: UserAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  };

  const getInitials = () => {
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Debug log
  console.log('[UserAvatar] Rendering with user:', {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    photoURL: user.photoURL,
    email: user.email
  });

  return (
    <div className={`relative inline-block ${className}`}>
      {hasStory && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
          <div className="bg-white rounded-full w-full h-full"></div>
        </div>
      )}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${hasStory ? 'p-0.5' : ''}`}>
        {user.photoURL ? (
          <img
            className="w-full h-full object-cover rounded-full"
            src={user.photoURL}
            alt={`${user.firstName} ${user.lastName}`}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center">
            <span className="font-bold">{getInitials()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
