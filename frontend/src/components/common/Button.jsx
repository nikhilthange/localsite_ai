import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 dark:shadow-primary-500/10',
  secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700',
  outline: 'border border-[rgb(var(--color-border))] bg-transparent text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))] active:bg-surface-100 dark:active:bg-surface-800',
  ghost: 'bg-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text))]',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
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
      whileHover={!disabled && !loading ? { scale: 1.01 } : undefined}
      className={twMerge(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        loading && 'cursor-wait relative overflow-hidden',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg className={twMerge('animate-spin shrink-0', size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' || size === 'xl' ? 'w-5 h-5' : 'w-4 h-4')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children && <span className="opacity-70">{children}</span>}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
