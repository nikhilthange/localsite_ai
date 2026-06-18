import { forwardRef, useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'border-gray-300 dark:border-gray-600 focus:ring-violet-500 focus:border-violet-500',
  error: 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-300 dark:border-green-500 focus:ring-green-500 focus:border-green-500',
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
          className={twMerge('block text-sm font-medium text-gray-700 dark:text-gray-300', labelClassName)}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={twMerge(
            'block w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error ? variants.error : success ? variants.success : variants.default,
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
