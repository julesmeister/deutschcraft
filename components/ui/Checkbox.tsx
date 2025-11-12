import { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  color?: 'blue' | 'purple' | 'green' | 'red';
  ref?: React.Ref<HTMLInputElement>;
}

export function Checkbox({
  label,
  error,
  helperText,
  containerClassName = '',
  checkboxClassName = '',
  labelClassName = '',
  color = 'blue',
  disabled,
  className = '',
  ref,
  ...props
}: CheckboxProps) {
    const colorClasses = {
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      green: 'text-green-500',
      red: 'text-red-500',
    };

    const baseCheckboxClasses =
      'cursor-pointer appearance-none align-middle shrink-0 w-5 h-5 transition-all duration-150 ease-in-out shadow-sm rounded border border-solid border-neutral-300 checked:bg-current checked:border-current group-hover:border-current disabled:opacity-50 disabled:cursor-not-allowed';

    return (
      <div className={containerClassName}>
        <label
          className={`cursor-pointer items-center gap-y-2.5 gap-x-2.5 font-semibold inline-flex group ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          } ${labelClassName}`}
        >
          <span className="relative">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              className={`${baseCheckboxClasses} ${colorClasses[color]} ${checkboxClassName} ${className} peer`}
              {...props}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute top-1/2 left-1/2 mt-[1.25px] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 fill-white stroke-white opacity-0 transition-opacity duration-150 ease-in-out peer-checked:opacity-100"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          {label && <span>{label}</span>}
        </label>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
}
