import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, Ruler, Rocket, Zap, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';

export default function FeaturedAsteroidCard({ data }) {
  const navigate = useNavigate();
  
  if (!data) return null;

  const riskScore = data.riskScore ?? 0;
  const daysUntilApproach = Math.ceil(
    (new Date(data.approachDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const handleCardClick = () => {
    navigate(`/asteroids/${data.nasaId || data._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="relative overflow-hidden rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent glass-card shadow-[0_0_40px_-12px_rgba(239,68,68,0.4)] cursor-pointer transition-all duration-300 hover:border-red-500/60 hover:shadow-[0_0_50px_-10px_rgba(239,68,68,0.5)]"
    >
      {/* Alert banner */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse" />
      
      {/* Glow orbs */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-red-500/20 blur-3xl opacity-40" aria-hidden />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-red-500/10 blur-3xl opacity-30" aria-hidden />

      <div className="relative p-5 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Highest Risk Object
              </span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 leading-tight hover:text-red-300 transition-colors">
              {data.name.replace(/[()]/g, '')}
            </h3>
            <p className="text-sm text-gray-400">
              Approaching Earth on <span className="text-white font-semibold">{data.approachDate}</span>
              {daysUntilApproach > 0 && (
                <span className="ml-2 text-red-400">({daysUntilApproach} days away)</span>
              )}
            </p>
          </div>
          <Badge variant="destructive" className="shrink-0 text-sm px-3 py-1.5">
            CRITICAL
          </Badge>
        </div>

        {/* Risk score - large prominent display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Risk Score
            </span>
            <span className="text-3xl font-heading font-bold text-red-400 tabular-nums">
              {riskScore}
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
              style={{ width: `${Math.min(100, riskScore)}%` }}
            />
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Calendar className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500">Approach</span>
            </div>
            <p className="text-sm font-semibold text-white tabular-nums">{data.approachDate}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Ruler className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-xs text-gray-500">Diameter</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{Math.round(data.diameter)} m</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Rocket className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-xs text-gray-500">Velocity</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{Math.round(data.velocity / 1000)}k km/h</p>
          </div>

          <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-accent-purple/20">
                <Zap className="h-4 w-4 text-accent-purple" />
              </div>
              <span className="text-xs text-gray-400">Miss Dist</span>
            </div>
            <p className="text-sm font-bold text-accent-purple font-mono tabular-nums">
              {(data.distance / 1000000).toFixed(2)}M km
            </p>
          </div>
        </div>

        {/* Hazard warning */}
        {data.isHazardous && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Classified as Potentially Hazardous Asteroid (PHA)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
