import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, Bell, LayoutDashboard, Home, Telescope, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    // Show Watchlist only for authenticated users
    ...(user ? [{ name: 'Watchlist', path: '/watchlist', icon: <Telescope size={18} /> }] : []),
    { name: 'Alerts', path: '/alerts', icon: <Bell size={18} /> },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-space-950/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-[4.25rem]">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobileMenu}>
            <div className="p-1.5 sm:p-2 rounded-xl bg-accent-purple/20 border border-accent-purple/30 group-hover:bg-accent-purple/30 group-hover:border-accent-purple/50 group-hover:shadow-[0_0_20px_-8px_rgba(139,92,246,0.4)] transition-all duration-200">
              <Rocket className="text-accent-purple h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-white">
              Cosmic<span className="text-accent-purple">Watch</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-accent-purple/90 text-white shadow-[0_0_24px_-8px_rgba(139,92,246,0.5)] border border-accent-purple/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/8 border border-transparent'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="relative p-2 sm:p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-colors" aria-label="Notifications">
              <Bell size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 ring-2 ring-space-950" />
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button className="hidden sm:flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{user.username || 'Profile'}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                  title="Terminate Session"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl border border-white/10 bg-accent-purple/90 text-white hover:bg-accent-purple/80 transition-all duration-200">
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="border-t border-white/10 bg-space-950/95 backdrop-blur-xl px-4 py-3 pb-4">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-accent-purple/90 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/8'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;