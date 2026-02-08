import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('alertPreferences').lean();
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const prefs = user.alertPreferences || {
      minRiskScore: 50,
      notifyImminent: true,
      emailFrequency: 'daily',
    };
    res.json(prefs);
  } catch (err) {
    console.error('[alerts/preferences GET]', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/preferences', auth, async (req, res) => {
  try {
    const { minRiskScore, notifyImminent, emailFrequency } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.alertPreferences = {
      minRiskScore: minRiskScore ?? 50,
      notifyImminent: notifyImminent ?? true,
      emailFrequency: emailFrequency ?? 'daily',
    };
    await user.save();
    res.json(user.alertPreferences);
  } catch (err) {
    console.error('[alerts/preferences POST]', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;