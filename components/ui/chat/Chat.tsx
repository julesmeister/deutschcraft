'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage, ChatMessageProps } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';

export interface Message extends ChatMessageProps {
  id: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: Date;
}

interface ChatProps {
  messages: Message[];
  conversations?: ChatHistoryItem[];
  activeConversationId?: string;
  onSendMessage: (message: string, attachments?: File[]) => void;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onCopyMessage?: (content: string) => void;
  onLikeMessage?: (messageId: string) => void;
  onDislikeMessage?: (messageId: string) => void;
  placeholder?: string;
  allowAttachments?: boolean;
  showSidebar?: boolean;
  isLoading?: boolean;
}

export function Chat({
  messages,
  conversations = [],
  activeConversationId,
  onSendMessage,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onCopyMessage,
  onLikeMessage,
  onDislikeMessage,
  placeholder = 'Enter a prompt here',
  allowAttachments = false,
  showSidebar = true,
  isLoading = false,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="text-neutral-500 font-medium text-sm sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl sm:px-6 md:px-8 sm:py-6 relative w-full mx-auto flex h-full flex-col px-4 py-4">
      <div className="sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl w-full mx-auto h-full">
        <div className="h-full">
          <div className="flex h-full gap-4">
            {/* Main chat area */}
            <div className="bg-white rounded-2xl border border-solid border-neutral-200 h-full flex-1">
              <div className="p-5 h-full">
                <div className="xl:h-full flex h-[calc(100%-theme(height.8))] flex-col justify-between">
                  {/* Messages area */}
                  <div className="xl:h-[calc(100%-theme(height.16))] relative h-[calc(100%-theme(height.24))]">
                    <div className="absolute top-0 left-0 h-full w-full py-4">
                      <div className="h-full overflow-y-auto">
                        <div className="flex flex-col gap-4 px-4">
                          {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-neutral-400">
                              <div className="text-center">
                                <p className="text-lg mb-2">No messages yet</p>
                                <p className="text-sm">Start a conversation below</p>
                              </div>
                            </div>
                          ) : (
                            messages.map((msg) => (
                              <ChatMessage
                                key={msg.id}
                                message={msg.message}
                                isSent={msg.isSent}
                                avatar={msg.avatar}
                                senderName={msg.senderName}
                              />
                            ))
                          )}

                          {/* Loading indicator */}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-5 py-2.5">
                                <div className="flex gap-1">
                                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input area */}
                  <ChatInput
                    onSendMessage={onSendMessage}
                    placeholder={placeholder}
                    disabled={isLoading}
                    allowAttachments={allowAttachments}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar (chat history) */}
            {showSidebar && onSelectConversation && onNewChat && (
              <ChatSidebar onNewChat={onNewChat}>
                {/* Simplified sidebar - full implementation pending */}
                <div className="text-sm text-gray-600">Chat history</div>
              </ChatSidebar>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
