export interface ChatMessageProps {
  /** Message text content */
  message: string;
  /** Whether this is a sent message (true) or received (false) */
  isSent?: boolean;
  /** Avatar URL for received messages */
  avatar?: string;
  /** Sender name (for accessibility) */
  senderName?: string;
}

export function ChatMessage({
  message,
  isSent = false,
  avatar,
  senderName,
}: ChatMessageProps) {
  if (isSent) {
    // Sent message (right-aligned, no avatar)
    return (
      <div className="flex justify-end">
        <div className="flex flex-col">
          <div className="inline-flex flex-row-reverse items-end justify-end gap-2">
            <div className="flex h-full max-w-72 flex-col justify-center rounded-xl bg-neutral-100 px-5 py-2.5 text-sm leading-snug text-neutral-900">
              {message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Received message (left-aligned, with avatar)
  return (
    <div className="flex">
      <div className="flex flex-col">
        <div className="inline-flex items-end gap-2">
          <div className="w-9">
            <span className="text-neutral-100 bg-neutral-400 inline-block relative rounded-full w-9 min-w-9 h-9 text-xs leading-9">
              {avatar && (
                <img
                  className="rounded-full object-cover w-full h-full"
                  loading="lazy"
                  src={avatar}
                  alt={senderName || 'User'}
                />
              )}
            </span>
          </div>
          <div className="flex h-full max-w-72 flex-col justify-center rounded-xl bg-neutral-100 px-5 py-2.5 text-sm leading-snug text-neutral-900">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
