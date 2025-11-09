import { ReactNode } from 'react';

export interface FormFieldProps {
  children: ReactNode;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  optional?: boolean;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  labelClassName?: string;
}

export function FormField({
  children,
  label,
  error,
  helperText,
  required = false,
  optional = false,
  layout = 'vertical',
  className = '',
  labelClassName = '',
}: FormFieldProps) {
  const layoutClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex items-start',
  };

  const labelLayoutClasses = {
    vertical: 'mb-2 block',
    horizontal: 'items-center flex h-12 pr-2 min-w-64',
  };

  return (
    <div className={`relative mb-7 flex-auto ${layoutClasses[layout]} ${className}`}>
      {label && (
        <label
          className={`font-semibold text-neutral-900 ${labelLayoutClasses[layout]} ${labelClassName}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
          {optional && (
            <span className="ml-1 text-sm font-normal text-neutral-500">
              (Optional)
            </span>
          )}
        </label>
      )}

      <div className="relative flex w-full flex-col justify-center">
        {children}

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    </div>
  );
}
