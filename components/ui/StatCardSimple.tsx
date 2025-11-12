import { ReactNode, useState, MouseEvent } from 'react';

export interface StatCardSimpleProps {
  /** Label text above the value */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Icon element or emoji */
  icon: ReactNode;
  /** Background color for card (e.g., 'bg-sky-100', 'bg-emerald-100') */
  bgColor?: string;
  /** Icon background color (defaults to dark) */
  iconBgColor?: string;
  /** Icon text color (defaults to white) */
  iconTextColor?: string;
  /** Optional click handler - makes the card clickable */
  onClick?: () => void;
  /** Whether this card is selected/active */
  isActive?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function StatCardSimple({
  label,
  value,
  icon,
  bgColor = 'bg-gray-100',
  iconBgColor = 'bg-neutral-900',
  iconTextColor = 'text-white',
  onClick,
  isActive = false,
}: StatCardSimpleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const Component = onClick ? 'button' : 'div';

  // Extract the color from bgColor for border matching
  const getBorderColor = (bg: string) => {
    if (bg.includes('blue')) return 'border-blue-300';
    if (bg.includes('orange')) return 'border-orange-300';
    if (bg.includes('emerald')) return 'border-emerald-300';
    if (bg.includes('purple')) return 'border-purple-300';
    if (bg.includes('amber')) return 'border-amber-300';
    return 'border-gray-300';
  };

  const createRipple = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!onClick) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    createRipple(event);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Component
      onClick={handleClick}
      className={`relative flex flex-col justify-center rounded-2xl ${bgColor} p-4 overflow-hidden transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${isActive ? `border-4 ${getBorderColor(bgColor)}` : 'border-4 border-transparent'}`}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}

      <div className="relative flex items-center justify-between">
        <div>
          <div className="mb-4 font-bold text-neutral-900">{label}</div>
          <h1 className="text-4xl font-bold leading-none mb-1 text-neutral-900">{value}</h1>
        </div>
        <div
          className={`flex max-h-12 min-h-12 max-w-12 min-w-12 items-center justify-center rounded-full ${iconBgColor} ${iconTextColor} text-2xl leading-snug`}
        >
          {icon}
        </div>
      </div>
    </Component>
  );
}
