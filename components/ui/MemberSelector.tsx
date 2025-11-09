'use client';

import { useState } from 'react';
import { Dialog } from './Dialog';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  isSelected?: boolean;
}

interface MemberSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onToggleMember: (memberId: string) => void;
  onDone?: () => void;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function MemberSelector({
  isOpen,
  onClose,
  members,
  onToggleMember,
  onDone,
  title = 'Add people',
  subtitle = 'Invite existing team member to this project.',
  searchPlaceholder = 'Quick search member',
  className = '',
}: MemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  console.log('[MemberSelector] Props received:', {
    isOpen,
    membersCount: members.length,
    members,
  });

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = members.filter((m) => m.isSelected).length;
  const availableCount = members.length;

  console.log('[MemberSelector] Calculated:', {
    filteredCount: filteredMembers.length,
    selectedCount,
    availableCount,
  });

  const handleDone = () => {
    onDone?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className={className}>
      {/* Header */}
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-lg text-gray-500"
            height="1em"
            width="1em"
          >
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
            <path d="M21 21l-6 -6"></path>
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-12 pl-10 pr-3 bg-gray-100 border border-gray-100 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Members List */}
      <div className="mt-4">
        <p className="font-semibold uppercase text-xs mb-4 text-gray-600">
          {availableCount} members available
        </p>
        <div className="mb-6">
          <div className="overflow-y-auto h-80 pr-2">
            {availableCount === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-900 font-bold text-lg mb-2">No students available</p>
                <p className="text-gray-500 text-sm">All students are already assigned to a teacher.</p>
              </div>
            ) : (
              <>
                {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="py-3 pr-5 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-gray-900 font-bold text-sm">
                        {member.initials ||
                          member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{member.name}</p>
                  </div>
                </div>

                {/* Add/Remove Button */}
                <button
                  type="button"
                  onClick={() => onToggleMember(member.id)}
                  className={`h-8 rounded-lg px-3 py-1 text-xs font-bold border transition-all ${
                    member.isSelected
                      ? 'bg-white border-gray-300 text-red-500 hover:border-red-500 hover:ring-1 hover:ring-red-500'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:ring-1 hover:ring-blue-600 hover:text-blue-600'
                  }`}
                >
                  {member.isSelected ? 'Remove' : 'Add'}
                </button>
              </div>
            ))}

                {filteredMembers.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    No members found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={handleDone}
          className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors"
        >
          Done {selectedCount > 0 && `(${selectedCount} selected)`}
        </button>
      </div>
    </Dialog>
  );
}
