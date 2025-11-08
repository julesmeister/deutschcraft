'use client';

import { ReactNode } from 'react';

interface IssueDetailFieldProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function IssueDetailField({
  icon,
  label,
  value,
  onClick,
  className = '',
}: IssueDetailFieldProps) {
  return (
    <div className={`flex items-center mb-2 ${className}`}>
      <div className="flex items-center gap-2 font-semibold text-gray-900 min-w-[150px]">
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </div>
      <div
        onClick={onClick}
        className={`flex px-3 min-h-[46px] rounded-xl ${
          onClick ? 'hover:bg-gray-100 cursor-pointer' : ''
        }`}
      >
        <div className="inline-flex items-center gap-1">{value}</div>
      </div>
    </div>
  );
}
