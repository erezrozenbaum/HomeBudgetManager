const express = require('express');
const router = express.Router();
const Database = require('../../database/init');
const crypto = require('crypto');
const { createHash, createCipheriv, createDecipheriv } = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { validateEmail, validatePassword } = require('../../utils/validators');

// Check if password protection is enabled
router.get('/status', async (req, res) => {
  try {
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['password_protection']);
    const isEnabled = setting?.value === 'true';
    res.json({ isEnabled });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check password protection status' });
  }
});

// Set password protection
router.post('/setup', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    
    if (!password || !confirmPassword) {
      return res.status(400).json({ error: 'Password and confirmation are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash the password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Generate encryption key from password
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);

    // Store the hashed password, salt, and encryption key
    await db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['password_hash', `${hash}:${salt}`]
    );
    await db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['encryption_key', key.toString('hex')]
    );
    await db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['encryption_iv', iv.toString('hex')]
    );
    await db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['password_protection', 'true']
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set up password protection' });
  }
});

// Verify password
router.post('/verify', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get stored hash and salt
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['password_hash']);
    if (!setting) {
      return res.status(400).json({ error: 'Password protection not set up' });
    }

    const [hash, salt] = setting.value.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    if (hash === verifyHash) {
      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // 24-hour session

      // Store session
      await db.run(
        'INSERT INTO sessions (token, expires_at) VALUES (?, ?)',
        [token, expires.toISOString()]
      );

      res.json({ 
        success: true,
        token,
        expires: expires.toISOString()
      });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

// Disable password protection
router.post('/disable', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Verify password first
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['password_hash']);
    if (!setting) {
      return res.status(400).json({ error: 'Password protection not set up' });
    }

    const [hash, salt] = setting.value.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    if (hash === verifyHash) {
      // Remove password protection
      await db.run('DELETE FROM settings WHERE key IN (?, ?, ?, ?)', [
        'password_hash',
        'encryption_key',
        'encryption_iv',
        'password_protection'
      ]);

      // Clear all sessions
      await db.run('DELETE FROM sessions');

      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable password protection' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Verify current password
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['password_hash']);
    if (!setting) {
      return res.status(400).json({ error: 'Password protection not set up' });
    }

    const [hash, salt] = setting.value.split(':');
    const verifyHash = crypto.pbkdf2Sync(currentPassword, salt, 1000, 64, 'sha512').toString('hex');

    if (hash === verifyHash) {
      // Generate new salt and hash
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 1000, 64, 'sha512').toString('hex');

      // Generate new encryption key
      const newKey = crypto.scryptSync(newPassword, newSalt, 32);
      const newIv = crypto.randomBytes(16);

      // Update stored values
      await db.run(
        'UPDATE settings SET value = ? WHERE key = ?',
        [`${newHash}:${newSalt}`, 'password_hash']
      );
      await db.run(
        'UPDATE settings SET value = ? WHERE key = ?',
        [newKey.toString('hex'), 'encryption_key']
      );
      await db.run(
        'UPDATE settings SET value = ? WHERE key = ?',
        [newIv.toString('hex'), 'encryption_iv']
      );

      // Clear all sessions
      await db.run('DELETE FROM sessions');

      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await db.run('DELETE FROM sessions WHERE token = ?', [token]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one number and one special character' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just return the token
    res.json({
      message: 'Password reset instructions sent to email',
      resetToken
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one number and one special character' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 