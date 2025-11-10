export interface ChatContactItemProps {
  /** Contact name */
  name: string;
  /** Avatar image URL */
  avatar: string;
  /** Last message preview */
  lastMessage: string;
  /** Time of last message */
  time: string;
  /** Whether this contact has unread messages */
  hasUnread?: boolean;
  /** Whether this contact is currently selected */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export function ChatContactItem({
  name,
  avatar,
  lastMessage,
  time,
  hasUnread = false,
  isActive = false,
  onClick,
}: ChatContactItemProps) {
  return (
    <div
      className={`relative flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-3 select-none hover:bg-neutral-100 ${
        isActive ? 'bg-neutral-100' : ''
      }`}
      role="button"
      onClick={onClick}
    >
      <div className="flex flex-1 items-center gap-2">
        <div>
          <span className="text-neutral-100 bg-neutral-400 inline-block relative w-10 h-10 leading-10 rounded-full">
            <img
              className="rounded-full object-cover w-full h-full"
              loading="lazy"
              src={avatar}
              alt={name}
            />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <div className="text-neutral-900 flex items-center gap-2 text-ellipsis whitespace-nowrap overflow-hidden font-bold">
              <span>{name}</span>
            </div>
          </div>
          <div className="text-ellipsis whitespace-nowrap overflow-hidden text-neutral-500">
            {lastMessage}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <small className="text-[80%] font-semibold text-neutral-500">{time}</small>
        {hasUnread && (
          <span className="h-3 w-3 rounded-full border border-white bg-blue-500" />
        )}
      </div>
    </div>
  );
}
