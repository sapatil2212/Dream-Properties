import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { pool } from './db.js';
import { transporter } from './mailer.js';
import { authenticateToken } from './authMiddleware.js';
import forgotPasswordRouter from './forgotpassword/forgotPassword.js';
import profileRouter from './userprofile/profile.js';
import saasAuthRouter from './saasownerapis/saasAuth.js';
import adminManagementRouter from './saasownerapis/adminManagement.js';
import superAdminRouter from './superadminaccess/superAdminController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', forgotPasswordRouter);
app.use('/api/profile', profileRouter);
app.use('/api/saas', saasAuthRouter);
app.use('/api/admin', adminManagementRouter);
app.use('/api/superadmin', superAdminRouter);

// Database initialization removed from here as pool is now in db.js
// but we still want to init tables on start
const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        property_type VARCHAR(50),
        looking_to VARCHAR(50),
        security_key VARCHAR(50),
        status ENUM('Active', 'Disabled') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pending Registrations (OTP Storage)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pending_users (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        property_type VARCHAR(50),
        looking_to VARCHAR(50),
        security_key VARCHAR(50),
        status ENUM('Active', 'Disabled') DEFAULT 'Active',
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Add security_key column if it doesn't exist
    try {
      await connection.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS security_key VARCHAR(50)');
      await connection.query('ALTER TABLE pending_users ADD COLUMN IF NOT EXISTS security_key VARCHAR(50)');
      await connection.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM("Active", "Disabled") DEFAULT "Active"');
      await connection.query('ALTER TABLE pending_users ADD COLUMN IF NOT EXISTS status ENUM("Active", "Disabled") DEFAULT "Active"');
    } catch (err) {
      console.log('Columns might already exist');
    }

    connection.release();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
};

initDB();

// Authentication Routes

// 1. Start Registration & Send OTP
app.post('/api/auth/register-step1', async (req, res) => {
  const { name, email, mobile, password, role, propertyType, lookingTo } = req.body;
  
  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store in pending table (upsert)
    await pool.query(`
      INSERT INTO pending_users (email, name, mobile, password, role, property_type, looking_to, otp, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      name=VALUES(name), mobile=VALUES(mobile), password=VALUES(password), 
      role=VALUES(role), property_type=VALUES(property_type), 
      looking_to=VALUES(looking_to), otp=VALUES(otp), expires_at=VALUES(expires_at)
    `, [email, name, mobile, hashedPassword, role, propertyType, lookingTo, otp, expiresAt]);

    // Send Email
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; color: #334155; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .otp { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; text-align: center; margin: 20px 0; }
          .footer { font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; pt: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify your email</h2>
          <p>Hello ${name}, use the code below to finish setting up your Dream Properties account:</p>
          <div class="otp">${otp}</div>
          <p style="font-size: 13px; color: #64748b;">This code will expire in 5 minutes.</p>
          <div class="footer">© 2026 Dream Properties</div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Verify your email - Dream Properties',
      html: emailTemplate
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// 2. Verify OTP & Create Account
app.post('/api/auth/verify-otp', async (req, res) => {
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

    // Move to main users table
    await pool.query(`
      INSERT INTO users (name, email, mobile, password, role, property_type, looking_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [user.name, user.email, user.mobile, user.password, user.role, user.property_type, user.looking_to]);

    // Delete from pending
    await pool.query('DELETE FROM pending_users WHERE email = ?', [email]);

    res.json({ message: 'Account verified and created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('\n=== LOGIN REQUEST DEBUG START ===');
    console.log('Login attempt for email:', email);
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        message: 'Wrong email id', 
        field: 'email' 
      });
    }

    const user = users[0];
    console.log('✅ User found in database:');
    console.log('  - ID:', user.id);
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Mobile:', user.mobile);
    console.log('  - Mobile type:', typeof user.mobile);
    console.log('  - Mobile is null?', user.mobile === null);
    console.log('  - Mobile is undefined?', user.mobile === undefined);
    console.log('  - Role:', user.role);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        message: 'Wrong password', 
        field: 'password' 
      });
    }

    console.log('✅ Password verified');
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log('✅ JWT token generated');
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    };
    
    console.log('📤 Sending response user object:', responseUser);
    console.log('=== LOGIN REQUEST DEBUG END ===\n');
    
    res.json({
      message: 'Login successful',
      user: responseUser
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
});

// Profile Routes moved to userprofile/profile.js
app.listen(port, () => {
  console.log(`Production server running on port ${port}`);
});
