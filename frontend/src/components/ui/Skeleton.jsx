import React from 'react';
import { cn } from '../../utils/cn';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-shimmer bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 dark:from-surface-800 dark:via-surface-700 dark:to-surface-800 bg-[length:200%_100%] rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
