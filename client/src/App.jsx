import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import AsteroidDetail from './pages/AsteroidDetail';
import AlertSettings from './components/AlertSettings';

const Alerts = () => (
  <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
    <AlertSettings />
  </div>
);

function App() {
  return (
    <AuthProvider> 
      <div className="min-h-screen bg-space-950 text-white selection:bg-accent-purple/30">
        <Navbar />
        <main> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/dashboard" element={<div className="pt-14 sm:pt-16"><Dashboard /></div>} />
            <Route path="/watchlist" element={<div className="pt-14 sm:pt-16"><Watchlist /></div>} />
            <Route path="/asteroids/:id" element={<div className="pt-14 sm:pt-16"><AsteroidDetail /></div>} />
            <Route path="/alerts" element={<Alerts />} />
            
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;