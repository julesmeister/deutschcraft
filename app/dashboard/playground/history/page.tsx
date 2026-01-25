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
        <div className="bg-white border border-neutral-200 p-4">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <span>📋</span>
            Session History
          </h3>

          {records.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm">No room history yet</div>
              <div className="text-xs mt-1">Create and end rooms to see statistics here</div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {records.map((record) => (
                <div
                  key={record.historyId}
                  className="py-3 first:pt-0 last:pb-0 hover:bg-neutral-50/50 -mx-2 px-2 transition-colors"
                >
                  {/* Row 1: Title, stats, duration */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-sm text-neutral-900 truncate max-w-[200px]">
                      {record.roomTitle}
                    </h4>
                    <span className="text-[10px] text-neutral-400">
                      {formatDate(record.createdAt)}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 ml-auto">
                      <span title="Participants">👥 {record.totalParticipants}</span>
                      <span title="Messages">💬 {record.totalMessages}</span>
                      <span title="Words written">✏️ {record.totalWordsWritten}</span>
                      <span title="Peak concurrent">📊 {record.maxConcurrentParticipants}</span>
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                        {formatDuration(record.durationMinutes)}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Participants + Tags (compact) */}
                  <div className="flex items-center gap-4 mt-1.5 text-[11px]">
                    {record.participantList && record.participantList.length > 0 && (
                      <span className="text-neutral-400 truncate max-w-[300px]">
                        {record.participantList.join(', ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <EditableTags
                        tags={record.tags}
                        onSave={(tags) => handleSaveTags(record.historyId, tags)}
                        isTeacher={userRole === 'teacher'}
                        syllabusOptions={syllabusOptions}
                      />
                    </span>
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
