import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const variantStyles = {
  blue: {
    card: 'hover:border-blue-500/40 hover:shadow-[0_0_32px_-12px_rgba(59,130,246,0.25)]',
    iconBg: 'bg-blue-500/20 border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'from-blue-500/10 to-transparent',
    accentBar: 'bg-blue-500/60',
    trend: 'text-blue-400',
  },
  red: {
    card: 'hover:border-red-500/40 hover:shadow-[0_0_32px_-12px_rgba(239,68,68,0.25)]',
    iconBg: 'bg-red-500/20 border-red-500/30',
    icon: 'text-red-400',
    glow: 'from-red-500/10 to-transparent',
    accentBar: 'bg-red-500/60',
    trend: 'text-red-400',
  },
  green: {
    card: 'hover:border-green-500/40 hover:shadow-[0_0_32px_-12px_rgba(34,197,94,0.25)]',
    iconBg: 'bg-green-500/20 border-green-500/30',
    icon: 'text-green-400',
    glow: 'from-green-500/10 to-transparent',
    accentBar: 'bg-green-500/60',
    trend: 'text-green-400',
  },
  amber: {
    card: 'hover:border-amber-500/40 hover:shadow-[0_0_32px_-12px_rgba(245,158,11,0.25)]',
    iconBg: 'bg-amber-500/20 border-amber-500/30',
    icon: 'text-amber-400',
    glow: 'from-amber-500/10 to-transparent',
    accentBar: 'bg-amber-500/60',
    trend: 'text-amber-400',
  },
  purple: {
    card: 'hover:border-accent-purple/40 hover:shadow-[0_0_32px_-12px_rgba(139,92,246,0.25)]',
    iconBg: 'bg-accent-purple/20 border-accent-purple/30',
    icon: 'text-accent-purple',
    glow: 'from-accent-purple/10 to-transparent',
    accentBar: 'bg-accent-purple/60',
    trend: 'text-accent-purple',
  },
  neutral: {
    card: 'hover:border-white/20',
    iconBg: 'bg-white/10 border-white/15',
    icon: 'text-gray-400',
    glow: 'from-white/5 to-transparent',
    accentBar: 'bg-white/20',
    trend: 'text-gray-400',
  },
};

const getTrendIcon = (trend) => {
  if (trend === 'up') return TrendingUp;
  if (trend === 'down') return TrendingDown;
  return Minus;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  pulse = false,
  trend,
  trendValue,
}) {
  const styles = variantStyles[variant] ?? variantStyles.neutral;
  
  // Render trend icon directly without creating component
  const renderTrendIcon = () => {
    if (!trend) return null;
    const IconComponent = getTrendIcon(trend);
    return <IconComponent className="h-3 w-3" />;
  };

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border border-white/10
        bg-gradient-to-br ${styles.glow}
        glass-card transition-all duration-300
        hover:-translate-y-1 hover:scale-[1.02]
        ${styles.card}
      `}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${styles.accentBar} opacity-80`} aria-hidden />

      {/* Animated glow orb */}
      <div
        className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${styles.accentBar} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}
        aria-hidden
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{title}</p>
            <p className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums leading-none">
              {value}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {subtitle && (
                <p className="text-xs text-gray-500 truncate" title={subtitle}>
                  {subtitle}
                </p>
              )}
              {trend && trendValue && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${styles.trend}`}>
                  {renderTrendIcon()}
                  {trendValue}
                </span>
              )}
            </div>
          </div>
          <div
            className={`
              flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border
              transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
              ${styles.iconBg}
            `}
          >
            {Icon && <Icon className={`h-7 w-7 ${styles.icon} ${pulse ? 'animate-pulse' : ''}`} />}
          </div>
        </div>
      </div>
    </div>
  );
}
