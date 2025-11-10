import { ReactNode } from 'react';

export interface ChatLayoutProps {
  /** Sidebar component */
  sidebar: ReactNode;
  /** Chat window component */
  chatWindow: ReactNode;
}

export function ChatLayout({ sidebar, chatWindow }: ChatLayoutProps) {
  return (
    <div className="text-neutral-500 text-sm font-medium leading-snug p-5 flex h-full flex-col">
      <div className="flex h-full flex-[auto] gap-8">
        {sidebar}
        {chatWindow}
      </div>
    </div>
  );
}
