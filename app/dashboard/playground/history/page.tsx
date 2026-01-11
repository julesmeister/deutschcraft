/**
 * Playground History Page
 * Displays room history with statistics (mimics analytics page design)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { StatGrid, StatItem } from '@/components/ui/StatGrid';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { getRoomHistory, getPlaygroundHistoryStats, updateHistoryTags } from '@/lib/services/turso';
import type { PlaygroundHistoryRecord, PlaygroundHistoryStats } from '@/lib/services/turso';
import { EditableTags } from '@/components/playground/EditableTags';
import { getAllSyllabusTagsOptions } from '@/lib/data/syllabusData';

export default function PlaygroundHistoryPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userRole } = getUserInfo(currentUser, session);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PlaygroundHistoryRecord[]>([]);
  const [stats, setStats] = useState<PlaygroundHistoryStats | null>(null);
  const [syllabusOptions] = useState<string[]>(() => getAllSyllabusTagsOptions());

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [historyRecords, historyStats] = await Promise.all([
        getRoomHistory(userId),
        getPlaygroundHistoryStats(userId),
      ]);
      setRecords(historyRecords);
      setStats(historyStats);
    } catch (error) {
      console.error('[PlaygroundHistory] Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleSaveTags = async (historyId: string, tags: string[]) => {
    try {
      await updateHistoryTags(historyId, tags);
      // Update local state
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.historyId === historyId ? { ...record, tags } : record
        )
      );
    } catch (error) {
      console.error('Error saving tags:', error);
      throw error;
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Room History 🕐"
          subtitle="Loading history data..."
          backButton={{
            label: 'Back to Playground',
            href: '/dashboard/playground',
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <CatLoader message="Loading room history..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Room History 🕐"
        subtitle="Complete statistics of your playground sessions"
        backButton={{
          label: 'Back to Playground',
          href: '/dashboard/playground',
        }}
      />

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Statistics Overview */}
        {stats && stats.totalRooms > 0 && (
          <StatGrid title="Overview">
            <StatItem
              label="Total Rooms"
              value={stats.totalRooms}
              unit="sessions"
            />
            <StatItem
              label="Total Duration"
              value={formatDuration(stats.totalDuration)}
              unit=""
            />
            <StatItem
              label="Total Participants"
              value={stats.totalParticipants}
              unit="unique users"
            />
            <StatItem
              label="Avg. Participants"
              value={stats.averageParticipants}
              unit="per room"
            />
          </StatGrid>
        )}

        {/* Room History List */}
        <div className="bg-white border border-neutral-200 p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>📋</span>
            Session History
          </h3>

          {records.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-sm">No room history yet</div>
              <div className="text-xs mt-1">Create and end rooms to see statistics here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.historyId}
                  className="p-4 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900">{record.roomTitle}</h4>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="inline-block px-3 py-1 bg-blue-500 text-white text-sm font-bold">
                        {formatDuration(record.durationMinutes)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="text-neutral-700 font-medium">
                        {record.totalParticipants} participant{record.totalParticipants !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-neutral-700 font-medium">
                        {record.totalMessages} message{record.totalMessages !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span className="text-neutral-700 font-medium">
                        {record.totalWordsWritten} word{record.totalWordsWritten !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="text-neutral-700 font-medium">
                        Peak: {record.maxConcurrentParticipants}
                      </span>
                    </div>
                  </div>

                  {/* Participants and Tags Section */}
                  <div className="pt-3 border-t border-neutral-200 space-y-2">
                    {record.participantList && record.participantList.length > 0 && (
                      <div className="text-xs text-neutral-500">
                        <span className="font-bold">Participants: </span>
                        <span className="text-neutral-600">{record.participantList.join(', ')}</span>
                      </div>
                    )}

                    {/* Editable Tags */}
                    <div className="text-xs">
                      <span className="font-bold text-neutral-500 inline-block align-middle">Tags:</span>
                      <span className="inline-block align-middle ml-2">
                        <EditableTags
                          tags={record.tags}
                          onSave={(tags) => handleSaveTags(record.historyId, tags)}
                          isTeacher={userRole === 'teacher'}
                          syllabusOptions={syllabusOptions}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
