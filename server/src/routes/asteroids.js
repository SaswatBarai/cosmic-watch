import express from 'express';
import { 
  getAsteroids, 
  getAsteroidById 
} from '../controllers/asteroidController.js';
import { auth } from '../middleware/auth.js';
import { researcherOnly } from '../middleware/rbac.js';
import Asteroid from '../models/Asteroid.js';
import User from '../models/User.js';
import { getMessages, addMessage } from '../services/asteroidChatStore.js';

const router = express.Router();

// Public routes
router.get('/', getAsteroids);

// Asteroid chat (live-chat style) – must be before /:id
router.get('/:id/chat', (req, res) => {
  try {
    const messages = getMessages(req.params.id);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to load messages' });
  }
});

router.post('/:id/chat', auth, async (req, res) => {
  try {
    const { text } = req.body || {};
    let userName = 'User';
    if (req.user?.id) {
      const u = await User.findById(req.user.id).select('username').lean();
      if (u?.username) userName = u.username;
    }
    const msg = addMessage(req.params.id, { userId: req.user?.id, userName, text });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to send message' });
  }
});

// Researcher-only routes (must be before /:id to avoid "analytics" matching :id)
router.get('/analytics/stats', auth, researcherOnly, async (req, res) => {
  try {
    const total = await Asteroid.countDocuments();
    const hazardous = await Asteroid.countDocuments({ isHazardous: true });
    const avgRisk = await Asteroid.aggregate([
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
    ]);
    const topRisk = await Asteroid.find().sort({ riskScore: -1 }).limit(5);

    res.json({
      total,
      hazardous,
      avgRiskScore: avgRisk[0]?.avgRisk?.toFixed(2) || 0,
      topRiskObjects: topRisk.map(a => ({ 
        name: a.name, 
        risk: a.riskScore, 
        date: a.approachDate 
      }))
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/analytics/refresh', auth, researcherOnly, async (req, res) => {
  try {
    // Trigger immediate NASA data refresh (researcher privilege)
    const { fetchAsteroidData } = await import('../services/nasaFetcher.js');
    await fetchAsteroidData();
    res.json({ msg: 'Data refresh initiated' });
  } catch (err) {
    res.status(500).json({ msg: 'Refresh failed' });
  }
});

// Single asteroid by ID or nasaId (must be last)
router.get('/:id', getAsteroidById);

export default router;