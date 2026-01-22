/**
 * RoleUsersTable Component
 * User table with search, filtering, and role management
 */

'use client';

import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { RoleActionsDropdown } from '@/components/ui/RoleActionsDropdown';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import { CatLoader } from '@/components/ui/CatLoader';
import { UserRole, User } from '@/lib/models/user';

interface RoleUsersTableProps {
  users: User[];
  isLoading: boolean;
  currentUserEmail: string | null;
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
  updatingUserId: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  roleFilter: 'all' | 'STUDENT' | 'TEACHER';
  onRoleFilterChange: (filter: 'all' | 'STUDENT' | 'TEACHER') => void;
}

export function RoleUsersTable({
  users,
  isLoading,
  currentUserEmail,
  onRoleChange,
  updatingUserId,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  roleFilter,
  onRoleFilterChange,
}: RoleUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Client-side display pagination (10 per screen)
  const displayPageSize = 10;
  const [displayPage, setDisplayPage] = useState(1);

  // Client-side search filter (on current page data)
  const filteredUsers = useMemo(() => {
    if (!deferredQuery.trim()) {
      return users;
    }

    const query = deferredQuery.toLowerCase();
    return users.filter((user: User) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const matchesName = fullName.includes(query);
      const matchesEmail = user.userId.toLowerCase().includes(query);
      return matchesName || matchesEmail;
    });
  }, [users, deferredQuery]);

  // Display pagination (10 per screen from 50 fetched)
  const displayTotalPages = Math.ceil(filteredUsers.length / displayPageSize);
  const startIndex = (displayPage - 1) * displayPageSize;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + displayPageSize
  );
  const isStale = searchQuery !== deferredQuery;

  // Reset display page when search/filter changes
  useEffect(() => {
    setDisplayPage(1);
  }, [deferredQuery, roleFilter]);

  // Load next server page when approaching end
  useEffect(() => {
    if (
      displayPage >= displayTotalPages - 1 &&
      currentPage < totalPages &&
      !isLoading
    ) {
      onPageChange(currentPage + 1);
    }
  }, [displayPage, displayTotalPages, currentPage, totalPages, isLoading, onPageChange]);

  // Transform users to table data
  const tableData = paginatedUsers.map((user: User) => {
    const isCurrentUser = user.userId === currentUserEmail;

    // Handle both formats: single 'name' field OR 'firstName'/'lastName' fields
    const displayName =
      (user as any).name ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.userId;

    return {
      id: user.userId,
      image:
        user.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=667eea&color=fff`,
      name: displayName,
      email: user.userId,
      role: user.role || 'PENDING_APPROVAL',
      roleDisplay: user.role || 'PENDING',
      level: user.cefrLevel || 'A1',
      isCurrentUser,
    };
  });

  return (
    <div className="bg-white border border-gray-200">
      {/* Title, Search, and Role Filter */}
      <div className="m-3 sm:m-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
            All Users
          </h5>
          {/* Role Filter */}
          <CompactButtonDropdown
            label={
              roleFilter === 'all'
                ? 'All Roles'
                : roleFilter === 'STUDENT'
                ? 'Students Only'
                : 'Teachers Only'
            }
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'STUDENT', label: 'Students Only' },
              { value: 'TEACHER', label: 'Teachers Only' },
            ]}
            value={roleFilter}
            onChange={(value) => onRoleFilterChange(value as typeof roleFilter)}
          />
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isStale && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12">
          <CatLoader message="Loading users..." size="lg" />
        </div>
      ) : (
        <SlimTable
          title=""
          columns={[
            {
              key: 'image',
              label: ' ',
              width: '60px',
              render: (value, row) => SlimTableRenderers.Avatar(value, row.name),
            },
            {
              key: 'name',
              label: 'User',
              render: (value, row) => (
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    {SlimTableRenderers.Link(value, `/dashboard/teacher/students/${encodeURIComponent(row.id)}`)}
                    {row.isCurrentUser && (
                      <span className="text-xs text-piku-purple font-medium">
                        (You)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Level: {row.level}</div>
                </div>
              ),
            },
            {
              key: 'email',
              label: 'Email',
              render: (value) => <p className="text-gray-500 text-xs">{value}</p>,
            },
            {
              key: 'roleDisplay',
              label: 'Role',
              align: 'center',
              render: (value) => <p className="text-gray-500 text-xs">{value}</p>,
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'center',
              width: '120px',
              render: (_, row) => (
                <RoleActionsDropdown
                  userId={row.id}
                  currentRole={row.role}
                  isCurrentUser={row.isCurrentUser}
                  onChangeRole={onRoleChange}
                  isUpdating={updatingUserId === row.id}
                />
              ),
            },
          ]}
          data={tableData}
          pagination={{
            currentPage: displayPage,
            totalPages: displayTotalPages,
            pageSize: displayPageSize,
            totalItems: filteredUsers.length,
            onPageChange: setDisplayPage,
          }}
          showViewAll={false}
          emptyMessage="No users found. Try adjusting your filters or search query."
        />
      )}
    </div>
  );
}
