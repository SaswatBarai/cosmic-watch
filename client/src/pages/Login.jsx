import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

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
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-space-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-purple/20 via-space-950 to-space-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div
                variants={item}
                className="mx-auto w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mb-4 border border-accent-purple/30"
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Rocket className="w-6 h-6 text-accent-purple" />
              </motion.div>
              <motion.div variants={item}>
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              </motion.div>
              <motion.div variants={item}>
                <CardDescription>Enter your credentials to access the DSN</CardDescription>
              </motion.div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form
              onSubmit={handleLogin}
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={item}>
                <input
                  type="email"
                  placeholder="Email (use the one you registered with)"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent-purple outline-none transition-colors"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
              </motion.div>
              <motion.div variants={item}>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent-purple outline-none transition-colors"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
              </motion.div>

              <motion.div variants={item}>
                <motion.button
                  type="submit"
                  className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 mt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  Initiate Session <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.form>

            <motion.div
              className="flex items-center justify-between text-xs text-gray-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.span whileHover={{ x: 2 }}>
                <Link to="/forgot-password" className="text-accent-purple hover:underline">Forgot password?</Link>
              </motion.span>
              <motion.span whileHover={{ x: 2 }}>
                <Link to="/register" className="text-accent-purple hover:underline">Need access?</Link>
              </motion.span>
            </motion.div>

            <motion.p
              className="mt-4 text-xs text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Use the <strong>email</strong> you registered with (not username).
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Login;