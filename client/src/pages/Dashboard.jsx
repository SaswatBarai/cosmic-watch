import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AsteroidCard from '../components/AsteroidCard';
import StatCard from '../components/StatCard';
import FeaturedAsteroidCard from '../components/FeaturedAsteroidCard';
import DashboardControls from '../components/DashboardControls';
import AlertSettings from '../components/AlertSettings'; // <--- IMPORT
import { Activity, AlertTriangle, Telescope, Sparkles, Star, Settings } from 'lucide-react'; // <--- IMPORT Settings

const Dashboard = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState('risk-desc');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  
  const isResearcher = user?.role === 'researcher';
  
  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await api.post('/asteroids/analytics/refresh');
      alert('Data refresh initiated! NASA data will be updated in a few moments.');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Refresh failed. Researcher access required.');
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleExportData = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Name,Risk Score,Approach Date,Diameter (m),Velocity (km/h),Distance (km)\n' +
      asteroids.map(a => 
        `"${a.name}",${a.riskScore},${a.approachDate},${a.diameter},${a.velocity},${a.distance}`
      ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cosmic-watch-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [showSettings, setShowSettings] = useState(false); // <--- STATE

  const fetchData = async () => {
    try {
      const res = await api.get('/asteroids');
      const data = res.data;
      setAsteroids(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAsteroids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
    const intervalId = setInterval(() => {
        fetchData(); 
    }, 30000);
    return () => clearInterval(intervalId); 
  }, []);

  const filteredAndSortedAsteroids = useMemo(() => {
    const list = Array.isArray(asteroids) ? asteroids : [];
    let filtered = [...list];
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterRisk !== 'all') {
      if (filterRisk === 'critical') {
        filtered = filtered.filter(a => a.riskScore > 75);
      } else if (filterRisk === 'warning') {
        filtered = filtered.filter(a => a.riskScore > 50 && a.riskScore <= 75);
      } else if (filterRisk === 'safe') {
        filtered = filtered.filter(a => a.riskScore <= 50);
      } else if (filterRisk === 'hazardous') {
        filtered = filtered.filter(a => a.isHazardous);
      }
    }

    if (sortBy === 'risk-desc') {
      filtered.sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));
    } else if (sortBy === 'risk-asc') {
      filtered.sort((a, b) => (a.riskScore ?? 0) - (b.riskScore ?? 0));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.approachDate) - new Date(b.approachDate));
    } else if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.approachDate) - new Date(a.approachDate));
    } else if (sortBy === 'distance-asc') {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'size-desc') {
      filtered.sort((a, b) => b.diameter - a.diameter);
    }

    return filtered;
  }, [asteroids, searchQuery, filterRisk, sortBy]);

  const stats = useMemo(() => {
    const list = Array.isArray(asteroids) ? asteroids : [];
    const total = list.length;
    const hazardous = list.filter(a => a && (a.isHazardous || a.riskScore > 75)).length;
    const safe = total - hazardous;
    
    const closest = list.reduce((prev, curr) => 
      curr && (!prev.distance || (curr.distance != null && curr.distance < prev.distance)) ? curr : prev, list[0] || {}
    );
    const highestRisk = list.reduce((prev, curr) =>
      curr && ((curr.riskScore ?? 0) > (prev?.riskScore ?? 0)) ? curr : prev, list[0] || null
    );

    return { total, hazardous, safe, closest, highestRisk };
  }, [asteroids]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Sparkles className="h-12 w-12 animate-pulse text-accent-purple mb-3" />
          <p className="text-sm font-medium">Initializing Deep Space Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-accent-purple" />
              Live Monitor
            </h2>
            {isResearcher && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <FlaskConical className="h-3 w-3" />
                Researcher
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Real-time NEO tracking powered by NASA</p>
        </div>
        
        {/* --- CONTROLS SECTION --- */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-gray-500 font-mono tabular-nums bg-white/[0.04] border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-lg">
            {new Date().toLocaleTimeString()}
          </span>
          
          {isResearcher && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={asteroids.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </>
          )}
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors border ${showSettings ? 'bg-accent-purple text-white border-accent-purple' : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- CONDITIONAL RENDER --- */}
      {showSettings && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <AlertSettings />
        </div>
      )}

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
    
        <StatCard
          title="Asteroids Today"
          value={stats.total}
          subtitle="Tracked in last 24h"
          icon={Telescope}
          variant="blue"
          trend="up" 
          trendValue="12%"
        />
        <StatCard
          title="Potential Hazards"
          value={stats.hazardous}
          subtitle="High risk trajectory"
          icon={AlertTriangle}
          variant={stats.hazardous > 0 ? 'red' : 'neutral'}
          pulse={stats.hazardous > 0}
        />
      
        <StatCard
          title="Closest Approach"
          value={stats.closest?.distance != null ? `${(stats.closest.distance / 1000000).toFixed(1)}M` : '—'}
          subtitle={stats.closest?.name?.replace(/[()]/g, '') || 'No data yet'}
          icon={Activity}
          variant="amber"
        />
        <StatCard
          title="User Watchlist"
          value="0"
          subtitle="Saved objects"
          icon={Star}
          variant="purple"
        />
      </div>

      {stats.highestRisk && stats.highestRisk.riskScore > 75 && (
        <FeaturedAsteroidCard data={stats.highestRisk} />
      )}
      
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg sm:text-xl font-semibold text-white">Near-Earth Objects</h3>
            <span className="text-xs text-gray-500 font-mono">
              {filteredAndSortedAsteroids.length} of {asteroids.length}
            </span>
          </div>
          <DashboardControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterRisk={filterRisk}
            onFilterChange={setFilterRisk}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {filteredAndSortedAsteroids.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No asteroids match your filters</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredAndSortedAsteroids.map((ast) => (
              <AsteroidCard key={ast._id || ast.nasaId} data={ast} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;