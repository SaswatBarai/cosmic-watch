import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const watchlist = Array.isArray(user.watchlist) ? user.watchlist : [];
    const { asteroidId, name } = req.body;
    if (watchlist.some(item => item.asteroidId === asteroidId)) {
      return res.status(400).json({ msg: 'Asteroid already in watchlist' });
    }
    user.watchlist = [{ asteroidId, name }, ...watchlist];
    await user.save();
    res.json(Array.isArray(user.watchlist) ? user.watchlist : []);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const watchlist = Array.isArray(user.watchlist) ? user.watchlist : [];
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const watchlist = Array.isArray(user.watchlist) ? user.watchlist : [];
    user.watchlist = watchlist.filter(item => item.asteroidId !== req.params.id);
    await user.save();
    res.json(Array.isArray(user.watchlist) ? user.watchlist : []);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;