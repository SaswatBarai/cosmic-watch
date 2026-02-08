import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, User, FlaskConical, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-space-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-space-950 to-space-950" />
      
      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30">
            <Rocket className="w-6 h-6 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Join the Network</CardTitle>
          <CardDescription>Create your Perilux access profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button type="button" onClick={() => setFormData({...formData, role: 'user'})}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'user' ? 'bg-accent-purple/20 border-accent-purple text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                <User className="w-5 h-5" /> <span className="text-xs font-bold uppercase">User</span>
              </button>
              <button type="button" onClick={() => setFormData({...formData, role: 'researcher'})}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'researcher' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                <FlaskConical className="w-5 h-5" /> <span className="text-xs font-bold uppercase">Researcher</span>
              </button>
            </div>

            <input type="text" placeholder="Username" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <input type="email" placeholder="Email Address" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})} />

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 mt-4">
              Initialize Account <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have access? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;