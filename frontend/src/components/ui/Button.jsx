import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { BiLoaderAlt } from 'react-icons/bi';

const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 overflow-hidden select-none";
  
  const variants = {
    primary: "bg-primary-600 text-white shadow-premium hover:bg-primary-700 active:bg-primary-800 hover:shadow-glow border border-transparent",
    secondary: "bg-surface-100 text-surface-900 border border-surface-200 hover:bg-surface-200 hover:border-surface-300 shadow-sm dark:bg-surface-800 dark:text-surface-50 dark:border-surface-700 dark:hover:bg-surface-700 dark:hover:border-surface-600",
    outline: "border border-surface-200 dark:border-surface-800 bg-transparent text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-900 active:bg-surface-100 dark:active:bg-surface-800",
    ghost: "bg-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100",
    danger: "bg-red-600 text-white shadow-premium hover:bg-red-700 active:bg-red-800 border border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base rounded-2xl",
    xl: "px-8 py-4 text-lg rounded-2xl",
    icon: "p-2 rounded-xl",
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      disabled={isDisabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isDisabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-[inherit] rounded-[inherit] z-10">
          <BiLoaderAlt className="animate-spin h-5 w-5" />
        </span>
      )}
      
      {/* Content */}
      <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
        {leftIcon && <span className="text-lg">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="text-lg">{rightIcon}</span>}
      </span>
    </motion.button>
  );
});

Button.displayName = "Button";
export { Button };
