import express from 'express';
import { pool } from '../db.js';
import { transporter } from '../mailer.js';
import { authenticateToken } from '../authMiddleware.js';

const router = express.Router();

// Middleware to check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super Admin only.' });
  }
};

// 1. Get all accounts (Users and SaaS Owners)
router.get('/accounts', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, mobile, role, status, security_key, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Fetch accounts error:', error);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

// 2. Toggle user status (Enable/Disable)
router.post('/accounts/toggle-status', authenticateToken, isSuperAdmin, async (req, res) => {
  const { userId, status } = req.body;
  
  if (!['Active', 'Disabled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ message: `User account ${status === 'Active' ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Failed to update account status' });
  }
});

// 3. Send login credentials to Admin
router.post('/accounts/send-credentials', authenticateToken, isSuperAdmin, async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    const emailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">Welcome to Dream Properties SaaS</h2>
        <p>Hello <b>${user.name}</b>,</p>
        <p>Your account has been approved and your login credentials are below:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><b>Name:</b> ${user.name}</p>
          <p style="margin: 5px 0;"><b>Email ID:</b> ${user.email}</p>
          <p style="margin: 5px 0;"><b>Password:</b> (Your chosen password)</p>
          <p style="margin: 5px 0; font-size: 18px; color: #1e293b;"><b>Security Key for Login:</b> <span style="font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${user.security_key}</span></p>
        </div>

        <p>Please keep this security key safe as it is required for every login attempt.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
          <p>© 2026 Dream Properties SaaS Portal</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Dream Properties SaaS" <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Your SaaS Portal Login Credentials',
      html: emailTemplate
    });

    res.json({ message: 'Login credentials sent successfully to ' + user.email });
  } catch (error) {
    console.error('Send credentials error:', error);
    res.status(500).json({ message: 'Failed to send credentials' });
  }
});

export default router;
