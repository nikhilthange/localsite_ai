import { forwardRef, useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'border-[rgb(var(--color-border))] focus:border-primary-500 focus:ring-primary-500/20',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
};

const Input = forwardRef(({
  label,
  error,
  success,
  helperText,
  icon: Icon,
  type = 'text',
  className,
  containerClassName,
  labelClassName,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={twMerge('space-y-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={twMerge('block text-sm font-medium text-[rgb(var(--color-text))]', labelClassName)}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className={twMerge('w-5 h-5', error ? 'text-red-400' : 'text-[rgb(var(--color-text-muted))]')} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={twMerge(
            'block w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] transition-all',
            Icon && 'pl-11',
            isPassword && 'pr-11',
            error ? variants.error : success ? variants.success : variants.default,
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">{error}</p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-[rgb(var(--color-text-muted))]">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
