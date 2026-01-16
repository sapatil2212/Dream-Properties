import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { transporter } from '../mailer.js';
import { authenticateToken } from '../authMiddleware.js';

const router = express.Router();

// Update Name and Mobile
router.post('/update-name', authenticateToken, async (req, res) => {
  const { name, mobile } = req.body;
  try {
    await pool.query('UPDATE users SET name = ?, mobile = ? WHERE id = ?', [name, mobile, req.user.id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('=== PROFILE API DEBUG START ===');
    console.log('Authenticated user ID from JWT:', req.user.id);
    console.log('Authenticated user role from JWT:', req.user.role);
    
    // Handle Super Admin virtual user
    if (req.user.id === 'superadmin' && req.user.role === 'SUPER_ADMIN') {
      console.log('✅ Identified as Super Admin (Virtual)');
      return res.json({
        id: 'superadmin',
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        mobile: 'N/A'
      });
    }

    const [users] = await pool.query('SELECT id, name, email, mobile, role FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found in database:', users[0]);
    console.log('Mobile value type:', typeof users[0].mobile);
    console.log('Mobile value length:', users[0].mobile?.length);
    console.log('=== PROFILE API DEBUG END ===');
    
    res.json(users[0]);
  } catch (error) {
    console.error('❌ Failed to fetch profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Verify Password
router.post('/verify-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  try {
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Request OTP for Sensitive Changes
router.post('/request-otp', authenticateToken, async (req, res) => {
  const { email, type } = req.body; // type: 'email' or 'password'
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(`
      INSERT INTO pending_users (email, name, mobile, password, role, otp, expires_at)
      VALUES (?, 'PROFILE_UPDATE', 'N/A', 'N/A', 'N/A', ?, ?)
      ON DUPLICATE KEY UPDATE otp=VALUES(otp), expires_at=VALUES(expires_at)
    `, [email, otp, expiresAt]);

    const subject = type === 'email' ? 'Verify your new email' : 'Verify your identity';
    const emailTemplate = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">${subject}</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">${otp}</div>
        <p style="font-size: 12px; color: #666;">This code expires in 5 minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject,
      html: emailTemplate
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Update Email
router.post('/update-email', authenticateToken, async (req, res) => {
  const { newEmail, otp } = req.body;
  try {
    const [pending] = await pool.query(
      'SELECT * FROM pending_users WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [newEmail, otp]
    );

    if (pending.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, req.user.id]);
    await pool.query('DELETE FROM pending_users WHERE email = ?', [newEmail]);

    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update email' });
  }
});

// Update Password
router.post('/update-password', authenticateToken, async (req, res) => {
  const { currentEmail, newPassword, otp } = req.body;
  try {
    const [pending] = await pool.query(
      'SELECT * FROM pending_users WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [currentEmail, otp]
    );

    if (pending.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    await pool.query('DELETE FROM pending_users WHERE email = ?', [currentEmail]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password' });
  }
});

export default router;
