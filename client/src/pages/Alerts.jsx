import { useState, useEffect } from 'react';
import { Bell, Save, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';


const Alerts = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: false,
    riskThreshold: 50
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/user');
        if (res.data.alertPreferences) {
          setPreferences(res.data.alertPreferences);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/auth/preferences', preferences);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save preferences.');
    }
  };

  if (loading) return <div className="pt-32 text-center text-gray-500">Loading preferences...</div>;

  return (
    <div className="min-h-screen pt-24 px-4 max-w-2xl mx-auto">
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-purple/20 rounded-lg border border-accent-purple/30">
              <Bell className="h-6 w-6 text-accent-purple" />
            </div>
            <CardTitle className="text-white">Alert Configuration</CardTitle>
          </div>
          <CardDescription>Configure when and how the Deep Space Network contacts you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {message}
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive daily reports on hazardous objects.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-purple"></div>
            </label>
          </div>

          <div className="space-y-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Risk Threshold</h3>
                <p className="text-sm text-gray-500">Only alert for risk scores above this value.</p>
              </div>
              <span className="text-2xl font-mono text-accent-purple font-bold">{preferences.riskThreshold}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={preferences.riskThreshold}
              onChange={(e) => setPreferences({...preferences, riskThreshold: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-purple"
            />
            <div className="flex justify-between text-xs text-gray-500 font-mono">
              <span>All Objects (0)</span>
              <span>Critical Only (75+)</span>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3 bg-accent-purple hover:bg-accent-purple/90 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;