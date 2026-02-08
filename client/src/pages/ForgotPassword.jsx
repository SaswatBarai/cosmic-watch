import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Rocket, ArrowRight, Mail, Lock, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (!email.trim()) {
      setMsg({ text: 'Email is required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setMsg({ text: res.data.msg || 'OTP sent! Check your email.', type: 'success' });
      setStep(2);
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || 'Failed to send OTP', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMsg({ text: 'All fields are required', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMsg({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      setMsg({ text: res.data.msg || 'Password reset successfully!', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || 'Failed to reset password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-space-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-purple/20 via-space-950 to-space-950" />
      
      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mb-4 border border-accent-purple/30">
            <Lock className="w-6 h-6 text-accent-purple" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {step === 1 ? 'Reset Password' : 'Enter Reset Code'}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? 'Enter your email to receive a reset code'
              : 'Check your email for the 6-digit code'}
          </CardDescription>
        </CardHeader>

        <CardContent>
         
          {msg.text && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${
              msg.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {msg.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {step === 1 ? (
           
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setMsg({ text: '', type: '' }); }}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-sm text-gray-500 pt-2">
                Remember your password? <Link to="/login" className="text-accent-purple hover:underline">Back to Login</Link>
              </div>
            </form>
          ) : (
           
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">6-Digit Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setMsg({ text: '', type: '' }); }}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1.5 text-center">Code expires in 10 minutes</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setMsg({ text: '', type: '' }); }}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setMsg({ text: '', type: '' }); }}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 text-center text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-400"
                >
                  ← Back to email entry
                </button>
                <p className="text-gray-500">
                  <Link to="/login" className="text-accent-purple hover:underline">Back to Login</Link>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
