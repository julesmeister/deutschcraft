import { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: 'default' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export function Label({
  children,
  required = false,
  optional = false,
  error = false,
  helperText,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: LabelProps) {
  const baseClasses = 'font-semibold';

  const variantClasses = {
    default: 'mb-2 block',
    inline: 'items-center flex h-12 pr-2 min-w-64',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const colorClasses = error ? 'text-red-500' : 'text-neutral-900';

  return (
    <div>
      <label
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${colorClasses} ${className}`}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
        {optional && (
          <span className="ml-1 text-sm font-normal text-neutral-500">
            (Optional)
          </span>
        )}
      </label>
      {helperText && (
        <p
          className={`mt-1 text-sm ${
            error ? 'text-red-500' : 'text-neutral-500'
          }`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
