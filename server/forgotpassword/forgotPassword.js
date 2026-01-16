import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { transporter } from '../mailer.js';

const router = express.Router();

// 4. Forgot Password - Send OTP
router.post('/forgot-password-otp', async (req, res) => {
  const { email } = req.body;
  console.log(`Password reset requested for: ${email}`);
  
  try {
    const [users] = await pool.query('SELECT name FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Reuse pending_users for OTP storage
    await pool.query(`
      INSERT INTO pending_users (email, name, mobile, password, role, otp, expires_at)
      VALUES (?, 'RESET_PASSWORD', 'N/A', 'N/A', 'N/A', ?, ?)
      ON DUPLICATE KEY UPDATE otp=VALUES(otp), expires_at=VALUES(expires_at)
    `, [email, otp, expiresAt]);

    console.log(`OTP generated for ${email}: ${otp}. Sending email...`);

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Reset your password - Dream Properties',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Reset Password</h2>
          <p>Use the code below to reset your Dream Properties account password:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">${otp}</div>
          <p style="font-size: 12px; color: #666;">This code expires in 5 minutes.</p>
        </div>
      `
    });

    console.log(`OTP email sent successfully to ${email}`);
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please check server logs.' });
  }
});

// 5. Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const [pending] = await pool.query(
      'SELECT * FROM pending_users WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );

    if (pending.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    await pool.query('DELETE FROM pending_users WHERE email = ?', [email]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;
