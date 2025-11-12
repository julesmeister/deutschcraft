import { InputHTMLAttributes, ReactNode, useState } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  wrapperClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  className = '',
  containerClassName = '',
  wrapperClassName = '',
  value,
  onChange,
  disabled,
  readOnly,
  ref,
  ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const showClearButton = clearable && value && !disabled && !readOnly;

    const baseClasses =
      'appearance-none text-neutral-800 bg-neutral-100 w-full font-semibold transition-all duration-150 ease-in-out px-3 py-2 rounded-xl border border-solid border-neutral-100 placeholder:text-neutral-400 focus-within:shadow-sm focus:shadow-sm focus:bg-white read-only:focus:bg-neutral-100 read-only:focus:shadow-sm read-only:focus:border-neutral-100 h-12 focus-within:border-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus-within:border-red-500'
      : '';

    const paddingClasses = leftIcon
      ? 'pl-11'
      : rightIcon || showClearButton
      ? 'pr-11'
      : '';

    return (
      <div className={containerClassName}>
        {label && (
          <label className="mb-2 block font-semibold text-neutral-900">
            {label}
          </label>
        )}

        <div className={`relative flex w-full flex-col justify-center ${wrapperClassName}`}>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            className={`${baseClasses} ${paddingClasses} ${errorClasses} ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {(rightIcon || showClearButton) && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex">
              {showClearButton ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="cursor-pointer transition-all duration-150 ease-in-out active:scale-95 bg-neutral-100 p-1.5 rounded-full hover:text-neutral-800 hover:bg-neutral-200 text-base leading-normal"
                >
                  <svg
                    strokeWidth="0"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 fill-current stroke-current"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                rightIcon && <div className="text-neutral-500">{rightIcon}</div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
}
