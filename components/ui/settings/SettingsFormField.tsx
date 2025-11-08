'use client';

import { ReactNode } from 'react';

interface SettingsFormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: (value: string) => void;
  className?: string;
  gridColumns?: 1 | 2;
  children?: ReactNode; // For custom input components
}

export function SettingsFormField({
  label,
  type = 'text',
  value,
  placeholder,
  name,
  onChange,
  className = '',
  gridColumns = 1,
  children,
}: SettingsFormFieldProps) {
  return (
    <div className={`mb-6 ${gridColumns === 2 ? 'col-span-1' : ''} ${className}`}>
      <label className="block font-semibold text-gray-900 mb-2">{label}</label>
      {children ? (
        children
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          name={name}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-12 px-3 bg-gray-100 border border-gray-100 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
        />
      )}
    </div>
  );
}
