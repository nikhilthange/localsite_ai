import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const scoreConfig = {
  excellent: { range: [80, 100], color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', ring: 'ring-emerald-500', label: 'Excellent' },
  good: { range: [60, 79], color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', ring: 'ring-blue-500', label: 'Good' },
  fair: { range: [40, 59], color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', ring: 'ring-amber-500', label: 'Fair' },
  poor: { range: [0, 39], color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', ring: 'ring-red-500', label: 'Needs Work' },
};

function getScoreConfig(score) {
  if (score >= 80) return scoreConfig.excellent;
  if (score >= 60) return scoreConfig.good;
  if (score >= 40) return scoreConfig.fair;
  return scoreConfig.poor;
}

export default function ScoreCard({ label, score, subtitle, icon: Icon, trend, size = 'md', className }) {
  const config = getScoreConfig(score);
  const isLarge = size === 'lg';
  const radius = isLarge ? 72 : 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        'relative flex flex-col items-center p-6 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm',
        config.border,
        className
      )}
    >
      {Icon && (
        <div className={twMerge('w-10 h-10 rounded-xl flex items-center justify-center mb-3', config.bg)}>
          <Icon className={twMerge('w-5 h-5', config.color)} />
        </div>
      )}

      <div className="relative mb-3">
        <svg width={radius * 2 + 16} height={radius * 2 + 16} className="-rotate-90">
          <circle cx={radius + 8} cy={radius + 8} r={radius}
            fill="none" stroke="currentColor"
            strokeWidth={isLarge ? 8 : 6}
            className="text-gray-100 dark:text-gray-800"
          />
          <circle cx={radius + 8} cy={radius + 8} r={radius}
            fill="none" stroke="currentColor"
            strokeWidth={isLarge ? 8 : 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={twMerge('transition-all duration-1000 ease-out', config.color.replace('text-', 'text-').replace('600', '500'))}
            style={{ color: config.ring.replace('ring-', '#') }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={twMerge('font-bold', isLarge ? 'text-3xl' : 'text-xl', config.color)}>
            {score}
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">{label}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      <span className={twMerge('mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium', config.bg, config.color)}>
        {config.label}
      </span>
      {trend && (
        <span className={twMerge('text-xs mt-2', trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-gray-400')}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
        </span>
      )}
    </motion.div>
  );
}

export function ScoreRow({ scores }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Object.entries(scores).map(([key, value]) => (
        <ScoreCard
          key={key}
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          score={value}
          size="sm"
        />
      ))}
    </div>
  );
}
