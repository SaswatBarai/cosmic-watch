import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Ruler, Zap, Calendar, Gauge, ChevronDown, Star, Clock, Share2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AsteroidCard = ({ data, showRemove = false, onRemoved }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.watchlist) {
      const isSaved = user.watchlist.some(w => w.asteroidId === (data.id || data._id || data.nasaId));
      setIsWatchlisted(Boolean(isSaved));
    }
  }, [user, data]);

  const getRiskVariant = (score) => {
    if (score > 75) return 'destructive';
    if (score > 50) return 'warning';
    return 'success';
  };

  const getRiskLabel = (score) => {
    if (score > 75) return 'CRITICAL';
    if (score > 50) return 'WARNING';
    return 'SAFE';
  };

  const getRiskBarColor = (score) => {
    if (score > 75) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (score > 50) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  const handleShare = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(`Check out asteroid ${data.name} on Perilux! Risk Score: ${data.riskScore}`);
    alert("Asteroid details copied to clipboard!");
  };

  const handleToggleWatchlist = async (e) => {
    e?.stopPropagation();

    if (!user) {
      alert('Please login to access the Deep Space Network database.');
      return;
    }

    setIsLoading(true);
    try {
      const asteroidId = data.id || data._id || data.nasaId;
      if (isWatchlisted) {
        await api.delete(`/watchlist/${asteroidId}`);
        setIsWatchlisted(false);
      } else {
        await api.post('/watchlist', { asteroidId: asteroidId, name: data.name });
        setIsWatchlisted(true);
      }
      // refresh global user/watchlist so other cards update
      
      try { await refreshUser(); } catch { /* ignore */ }
    } catch (error) {
      console.error('Watchlist error:', error);
      alert('Failed to update database. Connection unstable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (e) => {
    e?.stopPropagation();
    if (!user) {
      alert('Please login to modify your watchlist.');
      return;
    }
    setIsLoading(true);
    try {
      const asteroidId = data.id || data._id || data.nasaId;
      await api.delete(`/watchlist/${asteroidId}`);
      // refresh context
      try { await refreshUser(); } catch { /* ignore */ }
      if (typeof onRemoved === 'function') onRemoved(asteroidId);
    } catch (err) {
      console.error('Remove error', err);
      alert('Failed to remove from watchlist.');
    } finally {
      setIsLoading(false);
    }
  };

  const riskScore = data.riskScore ?? 0;
  const isHighRisk = riskScore > 75;
  const isWarning = riskScore > 50 && riskScore <= 75;

  const cardAccent = isHighRisk
    ? 'border-l-4 border-l-red-500/70 hover:border-red-500/80 hover:shadow-[0_0_32px_-12px_rgba(239,68,68,0.35)]'
    : isWarning
      ? 'border-l-4 border-l-amber-500/60 hover:border-amber-500/70 hover:shadow-[0_0_32px_-12px_rgba(245,158,11,0.3)]'
      : 'border-l-4 border-l-green-500/50 hover:border-green-500/60 hover:shadow-[0_0_32px_-12px_rgba(34,197,94,0.25)]';

  const glowBg = isHighRisk
    ? 'from-red-500/8 via-red-500/3 to-transparent'
    : isWarning
      ? 'from-amber-500/8 via-amber-500/3 to-transparent'
      : 'from-green-500/8 via-green-500/3 to-transparent';

  const daysUntilApproach = Math.ceil(
    (new Date(data.approachDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const handleCardClick = () => {
    navigate(`/asteroids/${data.nasaId || data._id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`
        group relative overflow-hidden glass-card min-w-0
        bg-gradient-to-br ${glowBg}
        border border-white/10 transition-all duration-300
        hover:-translate-y-1 cursor-pointer
        ${cardAccent}
      `}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-4 sm:p-5 pb-2">
        <CardTitle className="font-heading text-base sm:text-lg font-bold text-white min-w-0 leading-tight hover:text-accent-purple transition-colors">
          {data.name.replace(/[()]/g, '')}
        </CardTitle>
        <Badge variant={getRiskVariant(riskScore)} className="shrink-0 font-medium text-[10px] sm:text-xs">
          {getRiskLabel(riskScore)}
        </Badge>
      </CardHeader>

      <div className="px-4 sm:px-5 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getRiskBarColor(riskScore)} shadow-[0_0_8px_-2px_currentColor]`}
              style={{ width: `${Math.min(100, riskScore)}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 tabular-nums w-8 text-right">
            {riskScore}
          </span>
        </div>
      </div>

      <CardContent className="pt-0 px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3 group-hover:bg-white/[0.08] transition-colors min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 border border-accent-purple/30 group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5 text-accent-purple" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500">
                Approach Date
              </p>
              <p className="text-sm font-semibold text-white tabular-nums mt-0.5">{data.approachDate}</p>
              {daysUntilApproach > 0 && (
                <p className="text-[10px] text-accent-purple/80 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysUntilApproach} days away
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.06] hover:border-white/15 transition-all min-w-0">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mb-1">
                <Ruler className="h-3.5 w-3.5 shrink-0" /> Diameter
              </span>
              <span className="block font-mono text-sm font-bold text-white">
                {Math.round(data.diameter)} m
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.06] hover:border-white/15 transition-all min-w-0">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mb-1">
                <Rocket className="h-3.5 w-3.5 shrink-0" /> Velocity
              </span>
              <span className="block font-mono text-sm font-bold text-white">
                {Math.round(data.velocity / 1000)}k km/h
              </span>
            </div>
            <div className="col-span-2 rounded-xl border border-accent-purple/25 bg-accent-purple/10 p-3 hover:border-accent-purple/35 transition-colors min-w-0">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 mb-1">
                <Zap className="h-3.5 w-3.5 text-accent-purple shrink-0" /> Miss distance
              </span>
              <span className="block font-mono text-sm font-bold text-accent-purple tabular-nums">
                {(data.distance / 1000000).toFixed(2)} million km
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs">
                <p className="text-gray-500 mb-1">Hazardous Classification</p>
                <p className="text-white font-medium">
                  {data.isHazardous ? '⚠️ Potentially Hazardous' : '✓ Non-Hazardous'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs">
                <p className="text-gray-500 mb-1">NASA ID</p>
                <p className="text-white font-mono text-[10px]">{data.nasaId || data._id}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-accent-purple py-2 px-3 rounded-lg hover:bg-white/5 transition-all flex-1"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            <span className="font-medium">{isExpanded ? 'Show less' : 'Show more'}</span>
          </button>

            <div className="flex items-center gap-1">
             <button
              onClick={handleShare}
              className="flex items-center justify-center text-xs py-2 px-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            {showRemove ? (
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 text-xs py-2 px-3 rounded-lg
                  transition-all duration-200 font-medium text-red-400 border border-transparent hover:bg-white/5 hover:border-white/10
                  ${isLoading ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isLoading ? 'Removing...' : 'Remove'}</span>
              </button>
            ) : user ? (
              <button
                onClick={handleToggleWatchlist}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 text-xs py-2 px-3 rounded-lg
                  transition-all duration-200 font-medium
                  ${isWatchlisted 
                    ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30' 
                    : 'text-gray-500 hover:text-accent-purple hover:bg-white/5 border border-white/10 hover:border-accent-purple/30'
                  }
                  ${isLoading ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                <Star className={`h-3.5 w-3.5 ${isWatchlisted ? 'fill-accent-purple' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? 'Updating...' : (isWatchlisted ? 'Watching' : 'Watch')}</span>
              </button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AsteroidCard;