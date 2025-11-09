'use client';

import { useState } from 'react';
import { Search, MoreVertical, Plus } from 'lucide-react';

export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
}

interface ChatSidebarProps {
  conversations: ChatHistoryItem[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-solid border-neutral-200 xl:block xl:max-w-xs hidden h-full flex-1">
      {/* Search header */}
      <div className="rounded-t-2xl border-b border-neutral-200">
        <div className="flex h-16 w-full items-center gap-2 px-5">
          <Search className="h-5 w-5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-neutral-900 h-full flex-1 placeholder:text-base placeholder:leading-normal placeholder:text-neutral-400 outline-none bg-transparent"
            placeholder="Search chat"
          />
        </div>
      </div>

      {/* Chat history list */}
      <div className="h-[calc(100%-theme(height.36))]">
        <div className="flex flex-col h-full">
          {/* Scrollable conversation list */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 px-3 py-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`relative cursor-pointer rounded-xl py-3 px-5 hover:bg-neutral-100 group ${
                      activeConversationId === conversation.id ? 'bg-neutral-100' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div>
                      <div className="text-neutral-900 text-ellipsis whitespace-nowrap overflow-hidden font-bold">
                        {conversation.title}
                      </div>
                      <div className="text-ellipsis whitespace-nowrap overflow-hidden text-neutral-500">
                        {conversation.preview}
                      </div>
                    </div>

                    {/* Options menu */}
                    {onDeleteConversation && (
                      <div className="absolute top-0 bottom-0 flex w-8 items-center justify-end rounded-xl right-0 bg-gradient-to-l from-white via-white to-transparent group-hover:w-20 group-hover:from-neutral-100 group-hover:via-neutral-100">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === conversation.id ? null : conversation.id);
                            }}
                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-5 w-5 text-neutral-500" />
                          </button>

                          {/* Dropdown menu */}
                          {openMenuId === conversation.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conversation.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New chat button */}
          <div className="px-5 py-2 border-t border-neutral-200">
            <button
              onClick={onNewChat}
              className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:scale-[0.98] h-12 w-full rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
