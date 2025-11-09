'use client';

import { useState, useRef, useEffect } from 'react';
import { TaskMember } from './types';

interface AssigneeSelectorProps {
  members: TaskMember[];
  selectedIds: string[];
  onChange: (memberIds: string[]) => void;
}

export function AssigneeSelector({ members, selectedIds, onChange }: AssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter(id => id !== memberId));
    } else {
      onChange([...selectedIds, memberId]);
    }
  };

  return (
    <div className="relative" ref={selectorRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </svg>
        <span>Assignee {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] w-64 max-h-80 overflow-y-auto">
          {members.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No members available
            </div>
          ) : (
            <div className="p-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-piku-purple-dark rounded"
                  />
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
