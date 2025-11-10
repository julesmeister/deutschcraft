import { ReactNode } from 'react';

export interface ChatSidebarProps {
  title?: string;
  onSearchClick?: () => void;
  tabs?: { label: string; icon: ReactNode; active?: boolean; onClick?: () => void }[];
  children: ReactNode;
  onNewChat?: () => void;
  newChatText?: string;
}

export function ChatSidebar({
  title = 'Chat',
  onSearchClick,
  tabs,
  children,
  onNewChat,
  newChatText = 'New chat',
}: ChatSidebarProps) {
  return (
    <div className="md:block md:w-72 hidden w-full">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-neutral-900 text-xl font-bold leading-snug">{title}</h4>
            {onSearchClick && (
              <button className="cursor-pointer bg-neutral-100 p-1.5 rounded-full hover:text-neutral-800 hover:bg-neutral-200" onClick={onSearchClick}>
                <svg className="h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
              </button>
            )}
          </div>
          {tabs && tabs.length > 0 && (
            <div className="inline-flex p-1 rounded-xl w-full gap-2 bg-neutral-100">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  className={`cursor-pointer select-none font-semibold rounded-xl h-10 flex-1 px-5 py-2 ${
                    tab.active ? 'text-neutral-800 bg-white shadow-sm' : 'hover:text-neutral-800'
                  }`}
                  onClick={tab.onClick}
                >
                  <div className="flex items-center justify-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-col relative h-[calc(100%-9rem)] overflow-y-auto">
          <div className="flex flex-col gap-2">{children}</div>
        </div>
        {onNewChat && (
          <button className="h-12 w-full rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 font-bold" onClick={onNewChat}>
            {newChatText}
          </button>
        )}
      </div>
    </div>
  );
}
