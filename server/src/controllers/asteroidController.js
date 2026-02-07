import mongoose from 'mongoose';
import Asteroid from '../models/Asteroid.js';

export const getAsteroids = async (req, res) => {
  try {
    const asteroids = await Asteroid.find().sort({ riskScore: -1 });
    res.json(asteroids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAsteroidById = async (req, res) => {
  try {
    const { id } = req.params;
    let asteroid = null;

    if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
      asteroid = await Asteroid.findById(id);
    }
    if (!asteroid) {
      asteroid = await Asteroid.findOne({ nasaId: id });
    }
    if (!asteroid) {
      return res.status(404).json({ message: 'Asteroid not found' });
    }
    res.json(asteroid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};