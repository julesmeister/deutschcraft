/**
 * RevisionHistory Component
 * Shows the timeline of edits made to a writing submission
 * Uses ActivityTimeline to display word/phrase changes
 */

import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { ActivityCard } from '@/components/ui/activity/ActivityCard';
import { WritingVersion, TextChange } from '@/lib/models/writing';
import { formatDistanceToNow } from 'date-fns';

interface RevisionHistoryProps {
  versions: WritingVersion[];
  currentVersion: number;
  onRestoreVersion?: (version: number) => void;
}

export function RevisionHistory({
  versions,
  currentVersion,
  onRestoreVersion,
}: RevisionHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p className="text-sm">No revision history yet</p>
      </div>
    );
  }

  // Convert versions to activity items
  const activityItems: ActivityItem[] = versions
    .sort((a, b) => b.savedAt - a.savedAt) // Most recent first
    .map((version) => {
      const timeAgo = formatDistanceToNow(new Date(version.savedAt), { addSuffix: true });
      const isCurrent = version.version === currentVersion;

      // Get icon based on who edited
      const icon = version.editedBy ? '👤' : '💾';
      const iconColor = isCurrent ? 'bg-blue-500' : 'bg-neutral-400';

      return {
        id: `version-${version.version}`,
        icon: <span className="text-white text-sm">{icon}</span>,
        iconColor,
        title: `Version ${version.version}${isCurrent ? ' (Current)' : ''}`,
        description: version.changes || (version.editedBy ? `Edited by ${version.editedBy}` : 'Auto-saved'),
        timestamp: timeAgo,
        tags: [
          {
            label: `${version.wordCount} words`,
            color: 'gray',
          },
        ],
        metadata: (
          <div className="mt-3">
            {/* Show text changes if available */}
            {version.textChanges && version.textChanges.length > 0 && (
              <div className="space-y-2 mb-3">
                {version.textChanges.slice(0, 3).map((change, idx) => (
                  <TextChangeDisplay key={idx} change={change} />
                ))}
                {version.textChanges.length > 3 && (
                  <p className="text-xs text-neutral-500">
                    +{version.textChanges.length - 3} more changes
                  </p>
                )}
              </div>
            )}

            {/* Restore button for non-current versions */}
            {!isCurrent && onRestoreVersion && (
              <button
                onClick={() => onRestoreVersion(version.version)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Restore this version
              </button>
            )}
          </div>
        ),
      };
    });

  return (
    <ActivityCard title="Revision History" subtitle="Track all changes made to this writing">
      <ActivityTimeline items={activityItems} />
    </ActivityCard>
  );
}

interface TextChangeDisplayProps {
  change: TextChange;
}

function TextChangeDisplay({ change }: TextChangeDisplayProps) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return '➕';
      case 'delete':
        return '➖';
      case 'replace':
        return '🔄';
      default:
        return '✏️';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'insert':
        return 'text-emerald-700 bg-emerald-50';
      case 'delete':
        return 'text-red-700 bg-red-50';
      case 'replace':
        return 'text-amber-700 bg-amber-50';
      default:
        return 'text-neutral-700 bg-neutral-50';
    }
  };

  return (
    <div className={`text-xs p-2 rounded-lg border ${getChangeColor(change.type)}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm">{getChangeIcon(change.type)}</span>
        <div className="flex-1">
          {change.type === 'replace' && (
            <>
              <div className="line-through opacity-60">{change.oldText}</div>
              <div className="font-medium">{change.newText}</div>
            </>
          )}
          {change.type === 'insert' && (
            <div className="font-medium">{change.newText}</div>
          )}
          {change.type === 'delete' && (
            <div className="line-through opacity-60">{change.oldText}</div>
          )}
          {change.comment && (
            <p className="text-xs mt-1 opacity-75 italic">💬 {change.comment}</p>
          )}
          <p className="text-xs mt-1 opacity-60">
            by {change.editedBy} • {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
