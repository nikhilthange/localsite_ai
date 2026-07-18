import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2 text-sm text-surface-900 dark:text-surface-50 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-11",
          rightIcon && "pr-11",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
