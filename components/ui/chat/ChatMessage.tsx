'use client';

import { Avatar } from './Avatar';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  avatarSrc?: string;
}

interface ChatMessageProps {
  message: Message;
  onCopy?: (content: string) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export function ChatMessage({ message, onCopy, onLike, onDislike }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      navigator.clipboard.writeText(message.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col">
        {/* Message bubble with avatar */}
        <div
          className={`inline-flex items-end gap-2 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div className="w-9">
            <Avatar
              src={message.avatarSrc}
              alt={isUser ? 'You' : 'AI'}
              fallback={isUser ? 'U' : 'AI'}
            />
          </div>

          {/* Message content */}
          <div className="flex h-full max-w-screen-md flex-col justify-center rounded-xl bg-neutral-100 px-5 py-2.5 text-sm leading-snug text-neutral-900">
            {/* Support basic HTML formatting */}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          </div>
        </div>

        {/* Action buttons (only for assistant messages) */}
        {!isUser && (
          <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-9"></div>
            <div className="mt-0.5 flex">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="cursor-pointer rounded-full p-2 text-lg leading-normal transition-all duration-300 ease-in-out hover:text-neutral-900 text-neutral-500"
                title="Copy message"
              >
                {copied ? (
                  <span className="text-sm">✓</span>
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>

              {/* Like button */}
              {onLike && (
                <button
                  onClick={() => onLike(message.id)}
                  className="cursor-pointer rounded-full p-2 text-lg leading-normal transition-all duration-300 ease-in-out hover:text-neutral-900 text-neutral-500"
                  title="Like"
                >
                  <ThumbsUp className="h-5 w-5" />
                </button>
              )}

              {/* Dislike button */}
              {onDislike && (
                <button
                  onClick={() => onDislike(message.id)}
                  className="cursor-pointer rounded-full p-2 text-lg leading-normal transition-all duration-300 ease-in-out hover:text-neutral-900 text-neutral-500"
                  title="Dislike"
                >
                  <ThumbsDown className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
