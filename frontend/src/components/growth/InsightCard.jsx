import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiLightBulb, HiExclamation, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';

const severityConfig = {
  critical: { icon: HiExclamation, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'Critical' },
  warning: { icon: HiInformationCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'Warning' },
  success: { icon: HiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', label: 'Success' },
  info: { icon: HiLightBulb, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', label: 'Info' },
};

export default function InsightCard({ insight, onDismiss, onMarkRead, index = 0 }) {
  const config = severityConfig[insight.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={twMerge(
        'flex items-start gap-4 p-4 rounded-xl border transition-all',
        insight.read ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800' : `${config.bg} ${config.border}`,
      )}
    >
      <div className={twMerge('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
        <Icon className={twMerge('w-5 h-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={twMerge('text-xs font-semibold uppercase', config.color)}>{config.label}</span>
          {insight.metric && (
            <span className="text-xs text-gray-400">
              {insight.metric.name}: {insight.metric.value}{insight.metric.unit ? ` ${insight.metric.unit}` : ''}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{insight.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{insight.description}</p>
        <div className="flex items-center gap-3 mt-3">
          {!insight.read && (
            <button onClick={() => onMarkRead?.(insight._id)}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
              Mark as read
            </button>
          )}
          <button onClick={() => onDismiss?.(insight._id)}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
