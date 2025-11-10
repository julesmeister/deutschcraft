import { ReactNode, useState } from 'react';

export interface ChatWindowProps {
  /** Contact name */
  contactName: string;
  /** Contact avatar URL */
  contactAvatar: string;
  /** Status text (e.g., "last seen recently", "online") */
  statusText?: string;
  /** Message components */
  children: ReactNode;
  /** Placeholder for message input */
  inputPlaceholder?: string;
  /** Send message handler */
  onSendMessage?: (message: string) => void;
  /** File upload handler */
  onFileUpload?: (file: File) => void;
  /** Menu button click handler */
  onMenuClick?: () => void;
}

export function ChatWindow({
  contactName,
  contactAvatar,
  statusText = 'last seen recently',
  children,
  inputPlaceholder = 'Enter a prompt here',
  onSendMessage,
  onFileUpload,
  onMenuClick,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');

  const handleSend = () => {
    if (messageInput.trim() && onSendMessage) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-solid border-neutral-200 h-full max-h-full flex-1">
        {/* Header */}
        <div className="rounded-t-2xl border-b border-neutral-200 justify-between items-center flex px-5 py-3 h-24 bg-neutral-100">
          <div className="flex items-center gap-2">
            <button className="cursor-pointer flex items-center gap-2">
              <div>
                <span className="text-neutral-100 bg-neutral-400 inline-block relative w-10 h-10 leading-10 rounded-full">
                  <img
                    className="rounded-full object-cover w-full h-full"
                    loading="lazy"
                    src={contactAvatar}
                    alt={contactName}
                  />
                </span>
              </div>
              <div className="flex-1">
                <div className="text-neutral-900 text-ellipsis whitespace-nowrap overflow-hidden font-bold">
                  {contactName}
                </div>
                <div className="text-neutral-500 text-sm">{statusText}</div>
              </div>
            </button>
          </div>
          <span>
            <div className="flex items-center gap-2">
              {onMenuClick && (
                <button
                  className="cursor-pointer rounded-full bg-white p-2 text-xl leading-snug hover:bg-neutral-200 hover:text-neutral-800"
                  onClick={onMenuClick}
                >
                  <svg
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 fill-none stroke-current"
                  >
                    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                  </svg>
                </button>
              )}
            </div>
          </span>
        </div>

        {/* Messages Area */}
        <div className="p-5 relative h-[calc(100%-theme(height.24))]">
          <div className="flex h-full flex-col justify-between">
            <div className="relative h-[calc(100%-theme(height.24))]">
              <div className="absolute top-0 left-0 h-full w-full py-4">
                <div className="relative h-full max-w-full overflow-y-auto">
                  <div className="flex flex-col gap-4 px-4">{children}</div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex min-h-12 flex-col rounded-xl border-solid border-2 border-neutral-200 px-3">
              <div className="flex h-12 w-full items-center gap-2">
                {/* File Upload Button */}
                <div className="inline-block relative">
                  <input
                    className="appearance-none hidden absolute inset-0"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <button
                    className="cursor-pointer text-neutral-900 px-1 py-2 text-xl leading-snug hover:text-blue-500"
                    type="button"
                  >
                    <svg
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 fill-none stroke-current"
                    >
                      <path d="M15 8h.01" />
                      <path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" />
                      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4" />
                      <path d="M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54" />
                      <path d="M16 19h6" />
                      <path d="M19 16v6" />
                    </svg>
                  </button>
                </div>

                {/* Message Input */}
                <input
                  className="text-neutral-900 h-full flex-1 placeholder:text-neutral-400 outline-none"
                  placeholder={inputPlaceholder}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                {/* Send Button */}
                <button
                  className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:[scale:0.98] inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-base leading-normal text-white hover:bg-blue-600"
                  onClick={handleSend}
                >
                  <svg
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 fill-none stroke-current"
                  >
                    <path d="M5 12l14 0" />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
