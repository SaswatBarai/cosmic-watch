import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, User, FlaskConical, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

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
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-space-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-space-950 to-space-950"
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
                className="mx-auto w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30"
                whileHover={{ scale: 1.08, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Rocket className="w-6 h-6 text-blue-400" />
              </motion.div>
              <motion.div variants={item}>
                <CardTitle className="text-2xl font-bold text-white">Join the Network</CardTitle>
              </motion.div>
              <motion.div variants={item}>
                <CardDescription>Create your Perilux access profile</CardDescription>
              </motion.div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form
              onSubmit={handleSubmit}
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

              <motion.div variants={item} className="grid grid-cols-2 gap-4 mb-2">
                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'user' ? 'bg-accent-purple/20 border-accent-purple text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <User className="w-5 h-5" /> <span className="text-xs font-bold uppercase">User</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'researcher' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'researcher' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <FlaskConical className="w-5 h-5" /> <span className="text-xs font-bold uppercase">Researcher</span>
                </motion.button>
              </motion.div>

              <motion.div variants={item}>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </motion.div>
              <motion.div variants={item}>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </motion.div>
              <motion.div variants={item}>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </motion.div>

              <motion.div variants={item}>
                <motion.button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 mt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  Initialize Account <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.form>

            <motion.div
              className="mt-6 text-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Already have access?{' '}
              <motion.span whileHover={{ x: 2 }}>
                <Link to="/login" className="text-blue-400 hover:text-blue-300">Login here</Link>
              </motion.span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Register;