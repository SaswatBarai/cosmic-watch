import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

const sendTokenResponse = (user, statusCode, res) => {
  const payload = { user: { id: user.id, role: user.role } };
  
  const token = jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  };

  res
    .status(statusCode)
    .cookie('token', token, options) 
    .json({ success: true, user: { id: user.id, username: user.username, role: user.role, watchlist: user.watchlist } });
};

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('[auth/login] No user for email:', email?.substring(0, 3) + '***');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('[auth/login] Wrong password for email:', email?.substring(0, 3) + '***');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[auth/login]', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token'); 
  res.json({ msg: 'Logged out successfully' });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Invalid token' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const { username, email, currentPassword, newPassword } = req.body;

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(400).json({ msg: 'Username already taken' });
      }
      user.username = username.trim();
    }

    
    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      user.email = email.toLowerCase().trim();
    }

  
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Current password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ msg: 'New password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const updated = await User.findById(userId).select('-password').lean();
    res.json(updated);
  } catch (err) {
    console.error('[auth/profile]', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Username or email already exists' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});


router.delete('/profile', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Invalid token' });

    await User.findByIdAndDelete(userId);
    res.clearCookie('token');
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error('[auth/delete]', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
    
      return res.json({ msg: 'If that email exists, an OTP has been sent' });
    }

  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    

    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const sent = await sendOTPEmail(user.email, user.username, otp);
    if (!sent) {
      return res.status(500).json({ msg: 'Failed to send email. Try again later.' });
    }

    console.log(`[forgot-password] OTP sent to ${user.email.substring(0, 3)}***`);
    res.json({ msg: 'OTP sent to your email. Check your inbox.' });
  } catch (err) {
    console.error('[forgot-password]', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid request' });
    }


    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ msg: 'No reset request found. Request a new OTP.' });
    }


    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();
      return res.status(400).json({ msg: 'OTP expired. Request a new one.' });
    }


    if (user.resetOtp !== otp.trim()) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
 
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    console.log(`[reset-password] Password reset for ${user.email.substring(0, 3)}***`);
    res.json({ msg: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('[reset-password]', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Invalid token' });
    }
    const dbUser = await User.findById(userId).select('-password').lean();
    if (!dbUser) {
      res.clearCookie('token');
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(dbUser);
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;