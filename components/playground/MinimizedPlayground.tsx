/**
 * MinimizedPlayground Component
 * Floating minimized view of active playground session
 * Shows when user navigates away from playground page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaygroundSession } from '@/lib/contexts/PlaygroundSessionContext';

export function MinimizedPlayground() {
  const router = useRouter();
  const { session, maximize, endSession } = usePlaygroundSession();
  const [voiceIndicator, setVoiceIndicator] = useState(false);

  // Animate voice indicator when voice is active
  useEffect(() => {
    if (!session?.isVoiceActive) {
      setVoiceIndicator(false);
      return;
    }

    const interval = setInterval(() => {
      setVoiceIndicator(prev => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, [session?.isVoiceActive]);

  if (!session || !session.isMinimized) {
    return null;
  }

  const handleMaximize = () => {
    maximize();
    if (session.currentRoom?.roomId) {
      router.push(`/dashboard/playground/${session.currentRoom.roomId}`);
    }
  };

  const handleLeave = async () => {
    if (confirm('Are you sure you want to leave the playground session?')) {
      endSession();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden min-w-[320px] max-w-[380px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-purple/20 to-pastel-ocean/20 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-sm">Playground Active</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMaximize}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                title="Maximize"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
              <button
                onClick={handleLeave}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                title="Leave session"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Room info */}
          <div>
            <h3 className="font-bold text-base truncate">{session.currentRoom?.title}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {session.participants.length} {session.participants.length === 1 ? 'participant' : 'participants'}
            </p>
          </div>

          {/* Voice status */}
          {session.isVoiceActive && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className={`w-2 h-2 rounded-full bg-green-500 transition-opacity ${voiceIndicator ? 'opacity-100' : 'opacity-40'}`} />
              <span className="text-xs font-medium text-green-400">
                {session.isMuted ? 'Voice (Muted)' : 'Voice Active'}
              </span>
            </div>
          )}

          {/* Participants preview */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Participants:</p>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {session.participants.slice(0, 5).map(p => (
                <div key={p.participantId} className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-purple to-pastel-ocean flex items-center justify-center text-[10px] font-bold">
                    {p.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-300 truncate">{p.userName}</span>
                  {p.userId === session.currentRoom?.hostId && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Host</span>
                  )}
                </div>
              ))}
              {session.participants.length > 5 && (
                <p className="text-[10px] text-gray-500 pl-8">
                  +{session.participants.length - 5} more
                </p>
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleMaximize}
            className="w-full py-2.5 bg-white text-gray-900 font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors"
          >
            Return to Playground
          </button>
        </div>
      </div>
    </div>
  );
}
