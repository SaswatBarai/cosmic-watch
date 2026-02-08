import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, ShieldAlert, Save, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const AlertSettings = () => {
  const [prefs, setPrefs] = useState({ 
    minRiskScore: 50, 
    notifyImminent: true, 
    emailFrequency: 'daily' 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const { data } = await api.get('/alerts/preferences');
        if (data) setPrefs(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to load preferences", err);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/alerts/preferences', prefs);
      alert('Preferences updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-purple/20 border border-accent-purple/30">
            <Bell className="text-accent-purple w-5 h-5" />
          </div>
          <div>
            <CardTitle>Alert Configuration</CardTitle>
            <CardDescription>Customize your email notification preferences</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Risk Score Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="risk-threshold" className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Risk Threshold
              </Label>
              <span className="text-accent-purple font-mono font-bold text-base px-2 py-1 bg-accent-purple/10 rounded-lg">
                {prefs.minRiskScore}
              </span>
            </div>
            <Slider
              id="risk-threshold"
              min={0}
              max={100}
              step={1}
              value={[prefs.minRiskScore]}
              onValueChange={(value) => setPrefs({...prefs, minRiskScore: value[0]})}
            />
            <p className="text-xs text-gray-500">Alert me for asteroids with risk score above this value.</p>
          </div>

        
          <div className="space-y-4">
            <Label htmlFor="email-frequency" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Frequency
            </Label>
            <Select 
              value={prefs.emailFrequency}
              onValueChange={(value) => setPrefs({...prefs, emailFrequency: value})}
            >
              <SelectTrigger id="email-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary (09:00 AM)</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
                <SelectItem value="never">Do Not Send Emails</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Choose how often you want to receive email alerts.</p>
          </div>

          {/* Imminent Notification Toggle */}
          <div className="flex items-center justify-between bg-white/[0.06] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${prefs.notifyImminent ? 'bg-red-500/20' : 'bg-white/10'}`}>
                <Bell className={`w-4 h-4 ${prefs.notifyImminent ? 'text-red-400' : 'text-gray-500'}`} />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="imminent-alerts" className="text-white font-medium cursor-pointer">Imminent Alerts</Label>
                <p className="text-gray-500 text-xs font-normal">Notify for same-day approaches</p>
              </div>
            </div>
            <Switch
              id="imminent-alerts"
              checked={prefs.notifyImminent}
              onCheckedChange={(checked) => setPrefs({...prefs, notifyImminent: checked})}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertSettings;
