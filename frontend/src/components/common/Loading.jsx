import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function Loading({ fullPage, label, size = 'md', className }) {
  const spinner = (
    <motion.div
      className={twMerge('relative', sizes[size], className)}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
      role="status"
      aria-label={label || 'Loading'}
    >
      <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--color-border))]" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500" />
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-surface-950/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {label && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-[rgb(var(--color-text-muted))]"
            >
              {label}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-8" role="status" aria-label={label || 'Loading'}>
      {spinner}
      {label && <span className="text-sm text-[rgb(var(--color-text-muted))]">{label}</span>}
    </div>
  );
}
