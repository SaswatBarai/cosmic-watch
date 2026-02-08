import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, Suspense } from 'react';
import {
  ArrowLeft,
  Calendar,
  Ruler,
  Rocket,
  Zap,
  Gauge,
  AlertTriangle,
  Star,
  Share2,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import EarthHazardView from '../components/EarthHazardView';
import AsteroidChatPanel from '../components/AsteroidChatPanel';

const AsteroidDetail = () => {
  const { id } = useParams();
  const [asteroid, setAsteroid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoadingWatch, setIsLoadingWatch] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const fetchAsteroid = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/asteroids/${id}`);
        if (!cancelled) setAsteroid(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.status === 404 ? 'Asteroid not found' : 'Failed to load asteroid');
          setAsteroid(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAsteroid();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (user?.watchlist && asteroid) {
      const aid = asteroid._id || asteroid.nasaId;
      const saved = user.watchlist.some((w) => w.asteroidId === aid);
      setIsWatchlisted(Boolean(saved));
    }
  }, [user, asteroid]);

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

  const handleShare = () => {
    const text = `Check out asteroid ${asteroid?.name} on Perilux! Risk Score: ${asteroid?.riskScore}`;
    navigator.clipboard.writeText(text);
    alert('Asteroid details copied to clipboard!');
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      alert('Please log in to add to your watchlist.');
      return;
    }
    const asteroidId = asteroid._id || asteroid.nasaId;
    setIsLoadingWatch(true);
    try {
      if (isWatchlisted) {
        await api.delete(`/watchlist/${asteroidId}`);
        setIsWatchlisted(false);
      } else {
        await api.post('/watchlist', { asteroidId, name: asteroid.name });
        setIsWatchlisted(true);
      }
      try {
        await refreshUser();
      } catch {
        /* ignore */
      }
    } catch (err) {
      console.error('Watchlist error:', err);
      alert('Failed to update watchlist.');
    } finally {
      setIsLoadingWatch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-accent-purple border-t-transparent" />
          <p className="mt-4 text-gray-400">Loading asteroid data...</p>
        </div>
      </div>
    );
  }

  if (error || !asteroid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <p className="text-center text-gray-400 mb-4">{error || 'Asteroid not found'}</p>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskScore = asteroid.riskScore ?? 0;
  const isHighRisk = riskScore > 75;
  const isWarning = riskScore > 50 && riskScore <= 75;
  const cardAccent = isHighRisk
    ? 'border-l-4 border-l-red-500/70'
    : isWarning
      ? 'border-l-4 border-l-amber-500/60'
      : 'border-l-4 border-l-green-500/50';
  const glowBg = isHighRisk
    ? 'from-red-500/8 via-red-500/3 to-transparent'
    : isWarning
      ? 'from-amber-500/8 via-amber-500/3 to-transparent'
      : 'from-green-500/8 via-green-500/3 to-transparent';

  const daysUntilApproach = Math.ceil(
    (new Date(asteroid.approachDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const asteroidName = asteroid.name?.replace(/[()]/g, '') || 'Asteroid';

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link
        to="/dashboard"
        className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* 3D Interactive View – behavior changes based on hazard level */}
      <div className="relative rounded-2xl border border-white/20 overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 mb-8 shadow-2xl">
        {/* Glow effect based on hazard */}
        <div className={`absolute inset-0 opacity-20 blur-3xl ${
          isHighRisk ? 'bg-red-500/30' : isWarning ? 'bg-amber-500/25' : 'bg-green-500/20'
        }`} />
        
        <div className="relative">
          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-black/60 via-black/30 to-transparent">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full animate-pulse ${
                  isHighRisk ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-green-400'
                }`} />
                <span className="text-sm font-medium text-white/90">3D Model</span>
              </div>
              <span className="text-xs text-gray-400 backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                Drag to rotate • Scroll to zoom
              </span>
            </div>
          </div>

          <div className="h-[320px] sm:h-[400px]">
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
                  <span className="text-sm text-gray-400">Rendering Earth & asteroid trajectory...</span>
                </div>
              }
            >
              <EarthHazardView
                riskScore={riskScore}
                isHazardous={asteroid.isHazardous}
                diameter={asteroid.diameter}
                distance={asteroid.distance}
                velocity={asteroid.velocity}
                className="w-full h-full"
              />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Details area */}
        <div className="lg:col-span-3 space-y-6">
          <Card
            className={`
              overflow-hidden glass-card border border-white/10
              bg-gradient-to-br ${glowBg} ${cardAccent}
              transition-all duration-300 hover:shadow-2xl hover:border-white/20
            `}
          >
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    {asteroidName}
                  </h1>
                  <p className="text-gray-500 text-sm font-mono mt-1">
                    NASA ID: {asteroid.nasaId || asteroid._id}
                  </p>
                </div>
                <Badge variant={getRiskVariant(riskScore)} className="shrink-0 font-medium">
                  {getRiskLabel(riskScore)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getRiskBarColor(riskScore)}`}
                    style={{ width: `${Math.min(100, riskScore)}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-bold text-gray-400 w-10 text-right">
                  {riskScore}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {user && (
                  <Button
                    variant={isWatchlisted ? 'default' : 'outline'}
                    size="sm"
                    className={isWatchlisted ? 'bg-accent-purple/20 border-accent-purple/30 text-accent-purple' : 'border-white/20 text-white hover:bg-white/10'}
                    onClick={handleToggleWatchlist}
                    disabled={isLoadingWatch}
                  >
                    <Star className={`h-4 w-4 mr-2 ${isWatchlisted ? 'fill-current' : ''}`} />
                    {isLoadingWatch ? 'Updating...' : isWatchlisted ? 'Watching' : 'Add to Watchlist'}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                  Approach &amp; timing
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                </h2>
                <div className="group rounded-xl border border-white/10 bg-white/[0.06] p-5 flex items-center gap-4 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 border border-accent-purple/30 group-hover:scale-110 group-hover:bg-accent-purple/30 transition-all duration-300">
                    <Calendar className="h-6 w-6 text-accent-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold tabular-nums text-lg">{asteroid.approachDate}</p>
                    {daysUntilApproach > 0 && (
                      <p className="text-accent-purple/80 text-sm mt-1.5 flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{daysUntilApproach} days</span> until closest approach
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                  Physical &amp; orbital data
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.06] hover:border-white/15 hover:scale-[1.02] transition-all duration-300">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
                      <div className="p-1.5 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <Ruler className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      </div>
                      Diameter
                    </span>
                    <p className="font-mono text-xl font-bold text-white">
                      {asteroid.diameter != null ? `${Math.round(asteroid.diameter)} m` : '—'}
                    </p>
                  </div>
                  <div className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.06] hover:border-white/15 hover:scale-[1.02] transition-all duration-300">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
                      <div className="p-1.5 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                        <Rocket className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      </div>
                      Velocity
                    </span>
                    <p className="font-mono text-xl font-bold text-white">
                      {asteroid.velocity != null
                        ? `${(asteroid.velocity / 1000).toFixed(1)}k km/h`
                        : '—'}
                    </p>
                  </div>
                  <div className="sm:col-span-2 group rounded-xl border border-accent-purple/30 bg-gradient-to-br from-accent-purple/15 via-accent-purple/5 to-transparent p-5 hover:border-accent-purple/40 hover:scale-[1.01] transition-all duration-300 shadow-lg">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3">
                      <div className="p-1.5 rounded-lg bg-accent-purple/30 group-hover:bg-accent-purple/40 transition-colors">
                        <Zap className="h-3.5 w-3.5 text-accent-purple shrink-0" />
                      </div>
                      Miss distance
                    </span>
                    <p className="font-mono text-xl font-bold text-accent-purple tabular-nums">
                      {asteroid.distance != null
                        ? `${(asteroid.distance / 1_000_000).toFixed(2)} million km`
                        : '—'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                  Classification
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                </h2>
                <div className={`group rounded-xl border p-5 flex items-center gap-4 transition-all duration-300 ${
                  asteroid.isHazardous 
                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10' 
                    : 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10'
                }`}>
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    asteroid.isHazardous 
                      ? 'bg-amber-500/20 group-hover:bg-amber-500/30' 
                      : 'bg-green-500/20 group-hover:bg-green-500/30'
                  }`}>
                    <AlertTriangle
                      className={`h-6 w-6 shrink-0 ${asteroid.isHazardous ? 'text-amber-400' : 'text-green-400'}`}
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base">
                      {asteroid.isHazardous
                        ? 'Potentially Hazardous Object (PHO)'
                        : 'Non-hazardous Object'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {asteroid.isHazardous
                        ? 'Requires continuous monitoring'
                        : 'Safe trajectory confirmed'}
                    </p>
                  </div>
                </div>
              </section>

              {asteroid.lastUpdated && (
                <p className="text-xs text-gray-500">
                  Data last updated: {new Date(asteroid.lastUpdated).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live chat area */}
        <div className="lg:col-span-2">
          <AsteroidChatPanel
            asteroidId={asteroid.nasaId || asteroid._id}
            asteroidName={asteroidName}
          />
        </div>
      </div>
    </div>
  );
};

export default AsteroidDetail;
