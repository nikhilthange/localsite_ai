import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 shadow-sm',
  secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-400',
  outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-400',
  ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  className,
  type = 'button',
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      className={twMerge(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className={twMerge('animate-spin', size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4', Icon || children ? 'mr-2' : '')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className={twMerge(size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4', children ? 'mr-2' : '')} />
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
