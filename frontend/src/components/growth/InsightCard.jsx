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
        insight.read ? 'bg-white dark:bg-surface-800 border-[rgb(var(--color-border))]' : `${config.bg} ${config.border}`,
      )}
    >
      <div className={twMerge('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
        <Icon className={twMerge('w-5 h-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={twMerge('text-xs font-semibold uppercase', config.color)}>{config.label}</span>
          {insight.metric && (
            <span className="text-xs text-[rgb(var(--color-text-muted))]">
              {insight.metric.name}: {insight.metric.value}{insight.metric.unit ? ` ${insight.metric.unit}` : ''}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-sm text-[rgb(var(--color-text))]">{insight.title}</h4>
        <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">{insight.description}</p>
        <div className="flex items-center gap-3 mt-3">
          {!insight.read && (
            <button onClick={() => onMarkRead?.(insight._id)}
              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
              Mark as read
            </button>
          )}
          <button onClick={() => onDismiss?.(insight._id)}
            className="text-xs font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]">
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
