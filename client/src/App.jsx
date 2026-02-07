import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import Provider
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // Import Register
import Watchlist from './pages/Watchlist';
const Alerts = () => <div className="pt-32 text-center text-gray-500">Alerts (Protected)</div>;

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
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;