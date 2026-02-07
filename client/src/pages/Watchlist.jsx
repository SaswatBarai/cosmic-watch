import { useEffect, useState } from 'react';
import api from '../services/api';
import AsteroidCard from '../components/AsteroidCard';
import { Telescope } from 'lucide-react';

const Watchlist = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const { data: userWatchlist } = await api.get('/watchlist');

        if (!userWatchlist || userWatchlist.length === 0) {
          setFavorites([]);
          return;
        }

        // If backend returns full asteroid objects, use them directly
        const containsObjects = userWatchlist.every(w => w.asteroid && (w.asteroid._id || w.asteroid.nasaId));
        if (containsObjects) {
          setFavorites(userWatchlist.map(w => w.asteroid));
          return;
        }

        // Fallback: fetch all asteroids and filter by saved IDs
        const { data: allAsteroids } = await api.get('/asteroids');
        const savedIds = userWatchlist.map(w => w.asteroidId || w.asteroid || w.id).filter(Boolean);
        const filtered = allAsteroids.filter(ast => savedIds.includes(ast._id) || savedIds.includes(ast.nasaId) || savedIds.includes(ast.id));
        setFavorites(filtered);
      } catch (err) {
        console.error('Failed to load watchlist', err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (loading) return <div className="text-center pt-32 text-gray-500">Loading secure data...</div>;

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto pt-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent-purple/20 rounded-lg border border-accent-purple/30">
          <Telescope className="h-6 w-6 text-accent-purple" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Surveillance List</h2>
          <p className="text-sm text-gray-500">Objects under your personal observation</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <Telescope className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-white">No targets identified</h3>
          <p className="text-gray-500 mt-1">Add asteroids from the Dashboard to track them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {favorites.map((ast) => (
            <AsteroidCard
              key={ast._id || ast.nasaId || ast.id}
              data={ast}
              showRemove={true}
              onRemoved={(id) => setFavorites((prev) => prev.filter(f => !((f._id || f.nasaId || f.id) === id)))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
