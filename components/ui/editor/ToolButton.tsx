interface ToolButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

export function ToolButton({
  onClick,
  active = false,
  title,
  children,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center p-1.5 rounded-lg text-xl transition-colors ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-900 hover:text-blue-600'
      }`}
    >
      {children}
    </button>
  );
}
