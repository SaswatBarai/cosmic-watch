import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  User, Shield, Star, Bell, Lock,
  Save, Pencil, Trash2, LogOut, ChevronRight, AlertTriangle, Check, X
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 sm:p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl bg-accent-purple/15 border border-accent-purple/25">
        <Icon className="h-5 w-5 text-accent-purple" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const StatItem = ({ label, value, icon: Icon, variant = 'default' }) => {
  const colors = {
    default: 'text-gray-400 bg-white/5 border-white/10',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
  };
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${colors[variant]}`}>
      <div className="p-2 rounded-lg bg-white/5">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

 
  const [prefs, setPrefs] = useState({ minRiskScore: 50, notifyImminent: true, emailFrequency: 'daily' });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUsername(user.username || '');
    setEmail(user.email || '');
  }, [user, navigate]);

  
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const { data } = await api.get('/alerts/preferences');
        if (data) setPrefs(data);
      } catch {
        
      }
    };
    if (user) loadPrefs();
  }, [user]);

  const handleSaveProfile = async () => {
    setMsg({ text: '', type: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      if (username !== user.username) payload.username = username;
      if (email !== user.email) payload.email = email;
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setMsg({ text: 'No changes to save', type: 'info' });
        setSaving(false);
        return;
      }

      await api.put('/auth/profile', payload);
      await refreshUser();
      setEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMsg({ text: 'Profile updated successfully', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    setPrefsLoading(true);
    setPrefsSaved(false);
    try {
      await api.post('/alerts/preferences', prefs);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch {
      setMsg({ text: 'Failed to save preferences', type: 'error' });
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/profile');
      await logout();
      navigate('/');
    } catch {
      setMsg({ text: 'Failed to delete account', type: 'error' });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
     
    }
  };

  if (!user) return null;

  const watchlistCount = Array.isArray(user.watchlist) ? user.watchlist.length : 0;
  const memberSince = user._id
    ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <motion.div
      className="min-h-screen bg-space-950 pt-20 sm:pt-24 pb-16 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="max-w-3xl mx-auto space-y-6"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-5" variants={item}>
          <motion.div
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/20 border-2 border-purple-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {user.username?.[0]?.toUpperCase() || '?'}
          </motion.div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">{user.username}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                user.role === 'researcher'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
              }`}>
                <Shield className="h-3 w-3" />
                {user.role === 'researcher' ? 'Researcher' : 'Observer'}
              </span>
              <span className="text-xs text-gray-500">Member since {memberSince}</span>
            </div>
          </div>
        </motion.div>

      
        {msg.text && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium ${
              msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              msg.type === 'error'   ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                       'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {msg.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> :
             msg.type === 'error'   ? <AlertTriangle className="h-4 w-4 shrink-0" /> : null}
            <span>{msg.text}</span>
            <motion.button
              onClick={() => setMsg({ text: '', type: '' })}
              className="ml-auto p-1 hover:bg-white/10 rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        )}

       
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          variants={container}
        >
          {[
            { label: 'Role', value: user.role === 'researcher' ? 'Researcher' : 'Observer', icon: Shield, variant: 'blue' },
            { label: 'Watchlist', value: `${watchlistCount} object${watchlistCount !== 1 ? 's' : ''}`, icon: Star, variant: 'purple' },
            { label: 'Alerts', value: prefs.emailFrequency, icon: Bell, variant: 'amber' },
            { label: 'Min Risk', value: `${prefs.minRiskScore}+`, icon: AlertTriangle, variant: 'green' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={item} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
              <StatItem {...stat} />
            </motion.div>
          ))}
        </motion.div>

      
        <motion.div variants={item}>
          <SectionCard title="Profile Information" icon={User}>
            {!editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Username</label>
                    <p className="text-sm text-white mt-1 font-medium">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                    <p className="text-sm text-white mt-1 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Role</label>
                    <p className="text-sm text-white mt-1 font-medium capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Member Since</label>
                    <p className="text-sm text-white mt-1 font-medium">{memberSince}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-purple/15 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/25 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </motion.button>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Change Password (optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-purple outline-none transition-all"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-purple outline-none transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-purple outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <motion.button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-purple text-white hover:bg-accent-purple/90 disabled:opacity-50 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
                <motion.button
                  onClick={() => {
                    setEditing(false);
                    setUsername(user.username || '');
                    setEmail(user.email || '');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setMsg({ text: '', type: '' });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
          </SectionCard>
        </motion.div>

        
        <motion.div variants={item}>
          <SectionCard title="Alert Preferences" icon={Bell}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Minimum Risk Score</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={prefs.minRiskScore}
                    onChange={(e) => setPrefs(p => ({ ...p, minRiskScore: Number(e.target.value) }))}
                    className="flex-1 accent-accent-purple h-1.5 rounded-full"
                  />
                  <span className="text-sm font-mono text-white w-8 text-right">{prefs.minRiskScore}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Email Frequency</label>
                <select
                  value={prefs.emailFrequency}
                  onChange={(e) => setPrefs(p => ({ ...p, emailFrequency: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-purple outline-none appearance-none cursor-pointer"
                >
                  <option value="daily" className="bg-space-950">Daily</option>
                  <option value="weekly" className="bg-space-950">Weekly</option>
                  <option value="never" className="bg-space-950">Never</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Imminent Alerts</label>
                <button
                  onClick={() => setPrefs(p => ({ ...p, notifyImminent: !p.notifyImminent }))}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    prefs.notifyImminent
                      ? 'bg-green-500/10 border-green-500/25 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <span>{prefs.notifyImminent ? 'Enabled' : 'Disabled'}</span>
                  <div className={`h-5 w-9 rounded-full relative transition-colors ${prefs.notifyImminent ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${prefs.notifyImminent ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>
            <motion.button
              onClick={handleSavePrefs}
              disabled={prefsLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-purple/15 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/25 disabled:opacity-50 transition-all text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {prefsSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {prefsLoading ? 'Saving...' : prefsSaved ? 'Saved!' : 'Save Preferences'}
            </motion.button>
          </div>
          </SectionCard>
        </motion.div>

      
        <motion.div variants={item}>
          <SectionCard title="Watchlist" icon={Star}>
            {watchlistCount > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Array.isArray(user.watchlist) ? user.watchlist : []).slice(0, 6).map((item, i) => (
                    <motion.div
                      key={item.asteroidId || i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                    <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name || item.asteroidId}</p>
                      <p className="text-xs text-gray-500">
                        Added {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                      <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />
                    </motion.div>
                  ))}
                </div>
                {watchlistCount > 6 && (
                  <p className="text-xs text-gray-500 text-center">+{watchlistCount - 6} more objects</p>
                )}
                <motion.button
                  onClick={() => navigate('/watchlist')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Full Watchlist
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-10 w-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-400">No objects in your watchlist yet</p>
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 text-sm text-accent-purple hover:underline"
                  whileHover={{ x: 4 }}
                >
                  Browse asteroids on the Dashboard
                </motion.button>
              </div>
            )}
          </SectionCard>
        </motion.div>

       
        <motion.div variants={item}>
          <SectionCard title="Account" icon={Shield}>
            <div className="space-y-3">
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-600" />
              </motion.button>

              {!showDeleteConfirm ? (
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/30 transition-all text-sm font-medium"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-600" />
                </motion.button>
              ) : (
                <motion.div
                  className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Are you sure?</p>
                      <p className="text-xs text-red-300/60 mt-1">This will permanently delete your account, watchlist, and all preferences. This action cannot be undone.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </SectionCard>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default Profile;
