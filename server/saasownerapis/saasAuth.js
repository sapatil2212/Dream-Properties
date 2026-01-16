import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { transporter } from '../mailer.js';

const router = express.Router();

// Helper to generate random security key
const generateSecurityKey = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// 1. SaaS Signup Step 1 - Send OTP
router.post('/register-step1', async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(`
      INSERT INTO pending_users (email, name, mobile, password, role, otp, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      name=VALUES(name), mobile=VALUES(mobile), password=VALUES(password), 
      role=VALUES(role), otp=VALUES(otp), expires_at=VALUES(expires_at)
    `, [email, name, mobile, hashedPassword, role, otp, expiresAt]);

    const emailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Hello ${name},</p>
        <p>Your OTP for registration as ${role} is:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #2563eb; letter-spacing: 5px;">${otp}</div>
        <p>This OTP will expire in 5 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Dream Properties SaaS Portal</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'OTP for SaaS Portal Registration',
      html: emailTemplate
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('SaaS Registration Step 1 Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. SaaS Verify OTP & Generate Security Key
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [pending] = await pool.query(
      'SELECT * FROM pending_users WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );

    if (pending.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = pending[0];
    const securityKey = generateSecurityKey();

    // Insert into users table
    await pool.query(`
      INSERT INTO users (name, email, mobile, password, role, security_key)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [user.name, user.email, user.mobile, user.password, user.role, securityKey]);

    // Send emails based on role
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    
    // Email content for the user
    const userMailOptions = {
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Registration Successful - Dream Properties',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Registration Successful!</h2>
          <p>Hello ${user.name}, your registration as <b>${user.role}</b> is successful.</p>
          <p>Your login details (including the required Security Key) will be received via email shortly after admin approval if required, or you can use the key sent to your admin.</p>
          <p>Registration successful login details will be received via email.</p>
        </div>
      `
    };
    await transporter.sendMail(userMailOptions);

    // Email content for Security Key
    let securityKeyMailRecipient = superAdminEmail;
    let adminEmail = null;

    if (user.role === 'TELECALLER' || user.role === 'SALES_EXECUTIVE') {
      // Find an Admin to send the key to as well
      const [admins] = await pool.query('SELECT email FROM users WHERE role = "ADMIN" LIMIT 1');
      if (admins.length > 0) {
        adminEmail = admins[0].email;
      }
    }

    const keyEmailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h3 style="color: #2563eb;">New ${user.role} Registered</h3>
        <p><b>Name:</b> ${user.name}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Mobile:</b> ${user.mobile}</p>
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <p style="margin: 0; color: #64748b;">Security Key for Login:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e293b;">${securityKey}</p>
        </div>
      </div>
    `;

    // Send to Super Admin
    await transporter.sendMail({
      from: `"Dream Properties Alert" <${process.env.EMAIL_USERNAME}>`,
      to: superAdminEmail,
      subject: `Security Key Generated for ${user.role}: ${user.name}`,
      html: keyEmailHtml
    });

    // If Telecaller/Sales, also send to Admin
    if (adminEmail && (user.role === 'TELECALLER' || user.role === 'SALES_EXECUTIVE')) {
      await transporter.sendMail({
        from: `"Dream Properties Alert" <${process.env.EMAIL_USERNAME}>`,
        to: adminEmail,
        subject: `Staff Security Key: ${user.name} (${user.role})`,
        html: keyEmailHtml
      });
    }

    // Delete from pending
    await pool.query('DELETE FROM pending_users WHERE email = ?', [email]);

    res.json({ message: 'Registration successful login details will be received via email' });
  } catch (error) {
    console.error('SaaS Verification Error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// 3. SaaS Login
router.post('/login', async (req, res) => {
  const { email, password, securityKey } = req.body;

  try {
    // Check Super Admin first (from .env)
    if (email === process.env.SUPER_ADMIN_EMAIL) {
      if (password === process.env.SUPER_ADMIN_PASSWORD && securityKey === process.env.SUPER_ADMIN_SECURITY_KEY) {
        const token = jwt.sign(
          { id: 'superadmin', role: 'SUPER_ADMIN' },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' }
        );

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/'
        });

        return res.json({
          message: 'Login successful',
          user: { id: 'superadmin', name: 'Super Admin', email: email, role: 'SUPER_ADMIN' }
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials or security key' });
      }
    }

    // Check database for other roles
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if role is allowed for this login route
    const allowedRoles = ['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.security_key !== securityKey) {
      return res.status(401).json({ message: 'Invalid security key' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('SaaS Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
