'use client';

import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import { BorderBeam } from '@/components/ui/border-beam';

interface ProfileSidebarProps {
  user: User;
  batchName?: string;
  stats?: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    suggestionsGiven: number;
    suggestionsReceived: number;
    acceptanceRate: number;
    cardsLearned?: number;
    cardsMastered?: number;
    streak?: number;
    writingExercises?: number;
    wordsWritten?: number;
  };
}

export default function ProfileSidebar({ user, batchName, stats }: ProfileSidebarProps) {
  const defaultStats = {
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    suggestionsGiven: 0,
    suggestionsReceived: 0,
    acceptanceRate: 0,
    cardsLearned: 0,
    cardsMastered: 0,
    streak: 0,
    writingExercises: 0,
    wordsWritten: 0,
    ...stats
  };

  return (
    <div className="px-2 lg:px-0">
      <div className="bg-white border border-gray-200 overflow-hidden h-full">
        {/* Cover Image */}
        <div
          className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:brightness-110"
          style={{
            backgroundImage: 'url("/images/cover-placeholder.jpg")',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="pt-0 px-5 pb-5">
          <div className="text-center">
            {/* Avatar */}
            <div className="-mt-8 mb-3 relative flex items-center justify-center group w-24 h-24 mx-auto">
              {/* Avatar Image - Ensure it has a solid background border to cover inner beam glitches */}
              <div className="relative z-10 rounded-full border-[3px] border-white w-full h-full overflow-hidden bg-white">
                <UserAvatar user={user} size="lg" className="w-full h-full" />
              </div>
              
              {/* Border Beam - Positioned behind slightly */}
              <div className="absolute -inset-[5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden z-0">
                <BorderBeam size={120} duration={3} borderWidth={3} colorFrom="#24CAFF" colorTo="#9F54FF" />
              </div>
            </div>

            {/* User Info */}
            <h5 className="mb-0 text-lg font-bold">
              <a href="#" className="text-gray-800 hover:text-blue-600 transition-all duration-300">
                {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
              </a>
            </h5>
            <small className="text-sm text-gray-600 block mt-1">
              {user.role === 'STUDENT' ? `Level ${user.cefrLevel || 'A1'}` : 'Teacher'}
              {user.role === 'STUDENT' && batchName && (
                <span className="ml-2 px-2 py-0.5 bg-piku-mint text-green-800 text-xs font-medium">
                  {batchName}
                </span>
              )}
            </small>

            {/* Stats */}
            <div className="flex gap-2 justify-center mt-3">
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <h6 className="text-sm font-bold mb-0 text-gray-800">{defaultStats.postsCount}</h6>
                <small className="text-xs text-gray-600">Post</small>
              </div>
              <div className="w-px bg-gray-300 self-stretch opacity-25"></div>
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <h6 className="text-sm font-bold mb-0 text-gray-800">{defaultStats.suggestionsReceived}</h6>
                <small className="text-xs text-gray-600">Corrections</small>
              </div>
              <div className="w-px bg-gray-300 self-stretch opacity-25"></div>
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <h6 className="text-sm font-bold mb-0 text-gray-800">{defaultStats.suggestionsGiven}</h6>
                <small className="text-xs text-gray-600">Helped</small>
              </div>
            </div>

            {/* Learning Stats */}
            {user.role === 'STUDENT' && (
              <>
                <hr className="my-4 border-gray-200" />
                <div className="text-left">
                  <h6 className="text-sm font-semibold mb-3">Learning Progress</h6>
                  <div className="flex justify-between mb-2 transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Words Learned:</small>
                    <small className="font-bold text-gray-900">{defaultStats.cardsLearned}</small>
                  </div>
                  <div className="flex justify-between mb-2 transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Words Mastered:</small>
                    <small className="font-bold text-gray-900">{defaultStats.cardsMastered}</small>
                  </div>
                  <div className="flex justify-between mb-2 transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Current Streak:</small>
                    <small className="font-bold text-gray-900">{defaultStats.streak} days</small>
                  </div>
                  <div className="flex justify-between mb-2 transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Writing Exercises:</small>
                    <small className="font-bold text-gray-900">{defaultStats.writingExercises}</small>
                  </div>
                  <div className="flex justify-between mb-2 transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Words Written:</small>
                    <small className="font-bold text-gray-900">{defaultStats.wordsWritten}</small>
                  </div>
                  <div className="flex justify-between mb-2 transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Suggestions Given:</small>
                    <small className="font-bold text-gray-900">{defaultStats.suggestionsGiven}</small>
                  </div>
                  <div className="flex justify-between transform transition-all duration-300 hover:translate-x-1">
                    <small className="text-gray-600">Acceptance Rate:</small>
                    <small className="font-bold text-gray-900">
                      {defaultStats.acceptanceRate.toFixed(1)}%
                    </small>
                  </div>
                </div>
              </>
            )}
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Navigation */}
          <ul className="flex flex-col gap-2">
            <li>
              <a className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium transform hover:translate-x-1" href={`/dashboard/${user.role === 'STUDENT' ? 'student' : 'teacher'}/social/my-posts`}>
                <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                </svg>
                <span>My Feed</span>
              </a>
            </li>
            <li>
              <a className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium transform hover:translate-x-1" href={`/dashboard/${user.role === 'STUDENT' ? 'student' : 'teacher'}/social/notifications`}>
                <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                </svg>
                <span>Notifications</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
