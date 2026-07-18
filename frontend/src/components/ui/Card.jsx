import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, variant = 'default', hover = false, ...props }, ref) => {
  const variants = {
    default: "bg-white dark:bg-surface-900/50 border-surface-200 dark:border-surface-800 shadow-premium",
    glass: "glass-panel shadow-glass dark:shadow-glass-dark",
    flat: "bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-800",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border transition-all duration-300",
        variants[variant],
        hover && "hover:shadow-premium-hover hover:border-surface-300 dark:hover:border-surface-700 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-display font-semibold leading-none tracking-tight text-surface-950 dark:text-white", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-surface-500 dark:text-surface-400", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
