import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const spinTransition = {
  repeat: Infinity,
  ease: 'linear',
  duration: 1,
};

export default function Loading({ fullPage, label, size, className }) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  const spinner = (
    <motion.div
      className={twMerge('relative', sizeClasses, className)}
      animate={{ rotate: 360 }}
      transition={spinTransition}
    >
      <div className={twMerge(
        'absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700'
      )} />
      <div className={twMerge(
        'absolute inset-0 rounded-full border-2 border-transparent border-t-violet-600 dark:border-t-violet-400'
      )} />
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          {label && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {label}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-3 py-4">
      {spinner}
      {label && <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>}
    </div>
  );
}
