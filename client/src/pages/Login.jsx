import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { useAuth } from '../context/AuthContext'; // Import Auth
import { Rocket, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }
    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-space-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-purple/20 via-space-950 to-space-950" />
      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mb-4 border border-accent-purple/30">
            <Rocket className="w-6 h-6 text-accent-purple" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access the DSN</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
            
            <input type="email" placeholder="Email (use the one you registered with)" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent-purple outline-none"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
            <input type="password" placeholder="Password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent-purple outline-none"
              value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />

            <button type="submit" className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 mt-4">
              Initiate Session <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Need access? <Link to="/register" className="text-accent-purple hover:text-accent-purple/80">Register new terminal</Link>
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">
            Use the <strong>email</strong> you registered with (not username).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;