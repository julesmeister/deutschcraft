import { InputHTMLAttributes, ReactNode } from 'react';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  labelPosition?: 'left' | 'right';
  error?: string;
  helperText?: string;
  containerClassName?: string;
  toggleClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'red';
  onText?: string;
  offText?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Toggle({
  label,
  labelPosition = 'right',
  error,
  helperText,
  containerClassName = '',
  toggleClassName = '',
  labelClassName = '',
  size = 'md',
  color = 'blue',
  onText,
  offText,
  disabled,
  checked,
  className = '',
  ref,
  ...props
}: ToggleProps) {
    const colorClasses = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
    };

    const sizeClasses = {
      sm: {
        container: 'min-w-9 h-5',
        circle: 'w-4 h-4',
        textPadding: checked ? 'ml-1.5 mr-6' : 'mr-1.5 ml-6',
      },
      md: {
        container: 'min-w-11 h-6',
        circle: 'w-5 h-5',
        textPadding: checked ? 'ml-2 mr-7' : 'mr-2 ml-7',
      },
      lg: {
        container: 'min-w-14 h-8',
        circle: 'w-7 h-7',
        textPadding: checked ? 'ml-2.5 mr-9' : 'mr-2.5 ml-9',
      },
    };

    const currentSize = sizeClasses[size];
    const currentColor = checked ? colorClasses[color] : 'bg-neutral-300';

    const toggleElement = (
      <label
        className={`cursor-pointer items-center ${currentSize.container} transition-all duration-200 ease-in-out inline-flex relative rounded-3xl ${currentColor} ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${toggleClassName}`}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="hidden"
          {...props}
        />
        <div
          className={`${currentSize.circle} duration-200 ease-in-out absolute -translate-y-1/2 top-1/2 before:content-[""] before:bg-white before:absolute before:rounded-xl before:inset-0 ${
            checked ? 'left-[calc(100%-theme(inset.6))]' : 'left-1'
          }`}
        />
        {(onText || offText) && (
          <span
            className={`text-white transition-all duration-200 ease-in-out text-xs font-medium ${
              checked ? currentSize.textPadding : currentSize.textPadding
            }`}
          >
            {checked ? onText : offText}
          </span>
        )}
      </label>
    );

    const labelElement = label && (
      <span className={`font-semibold ${labelClassName}`}>{label}</span>
    );

    return (
      <div className={containerClassName}>
        <div className="flex items-center gap-2">
          {labelPosition === 'left' && labelElement}
          {toggleElement}
          {labelPosition === 'right' && labelElement}
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
}
