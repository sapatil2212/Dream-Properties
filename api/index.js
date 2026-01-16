// Vercel Serverless Function - Main API Handler
// This wraps your Express.js app for Vercel deployment

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../server/db.js';
import { transporter } from '../server/mailer.js';
import { authenticateToken } from '../server/authMiddleware.js';
import forgotPasswordRouter from '../server/forgotpassword/forgotPassword.js';
import profileRouter from '../server/userprofile/profile.js';
import saasAuthRouter from '../server/saasownerapis/saasAuth.js';
import adminManagementRouter from '../server/saasownerapis/adminManagement.js';
import superAdminRouter from '../server/superadminaccess/superAdminController.js';
import builderRouter from '../server/builder/builderController.js';
import cloudinary from '../server/cloudinaryConfig.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Mount routers
app.use('/api/auth', forgotPasswordRouter);
app.use('/api/profile', profileRouter);
app.use('/api/saas', saasAuthRouter);
app.use('/api/admin', adminManagementRouter);
app.use('/api/superadmin', superAdminRouter);
app.use('/api/builder', builderRouter);

// Image upload endpoint
app.post('/api/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'dream-properties',
      resource_type: 'auto'
    });

    res.json({ 
      success: true, 
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

// Initialize database tables on first run (only in development or first deploy)
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
        project_name VARCHAR(255),
        property_address TEXT,
        security_key VARCHAR(50),
        status ENUM('Active', 'Disabled') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        builder_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(100),
        area VARCHAR(100),
        location VARCHAR(255),
        address TEXT,
        type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending Approval',
        bedrooms INT,
        bathrooms INT,
        possession_date VARCHAR(50),
        rera_id VARCHAR(100),
        amenities JSON,
        images JSON,
        highlights JSON,
        specifications JSON,
        project_units INT,
        project_area VARCHAR(100),
        configurations VARCHAR(255),
        avg_price VARCHAR(100),
        launch_date VARCHAR(50),
        sizes VARCHAR(255),
        project_size VARCHAR(255),
        area_unit VARCHAR(50),
        property_subtype VARCHAR(100),
        map_link TEXT,
        nearby_locations JSON,
        attachments JSON,
        listing_type ENUM('Sell', 'Rent', 'Lease') DEFAULT 'Sell',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Pending users (OTP)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pending_users (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        property_type VARCHAR(50),
        looking_to VARCHAR(50),
        project_name VARCHAR(255),
        property_address TEXT,
        security_key VARCHAR(50),
        status ENUM('Active', 'Disabled') DEFAULT 'Active',
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Favorites
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_property (user_id, property_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
};

// Only init DB on cold start (not every request)
let dbInitialized = false;
if (!dbInitialized) {
  initDB().then(() => { dbInitialized = true; });
}

// Authentication Routes

// 1. Register Step 1 - Send OTP
app.post('/api/auth/register-step1', async (req, res) => {
  const { name, email, mobile, password, role, propertyType, lookingTo, projectName, propertyAddress } = req.body;
  
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(`
      INSERT INTO pending_users (email, name, mobile, password, role, property_type, looking_to, project_name, property_address, otp, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      name=VALUES(name), mobile=VALUES(mobile), password=VALUES(password), 
      role=VALUES(role), property_type=VALUES(property_type), 
      looking_to=VALUES(looking_to), project_name=VALUES(project_name), 
      property_address=VALUES(property_address), otp=VALUES(otp), expires_at=VALUES(expires_at)
    `, [email, name, mobile, hashedPassword, role, propertyType, lookingTo, projectName, propertyAddress, otp, expiresAt]);

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

// 2. Verify OTP
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

    await pool.query(`
      INSERT INTO users (name, email, mobile, password, role, property_type, looking_to, project_name, property_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user.name, user.email, user.mobile, user.password, user.role, user.property_type, user.looking_to, user.project_name, user.property_address]);

    await pool.query('DELETE FROM pending_users WHERE email = ?', [email]);

    if (user.role === 'BUILDER') {
      // Send emails (builder confirmation + admin notification)
      const builderEmailTemplate = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #334155;">
          <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin:0;">Welcome to Dream Properties!</h2>
            </div>
            <div style="padding: 20px 0;">
              <p>Dear ${user.name},</p>
              <p>Congratulations! Your builder account has been successfully created.</p>
              <p><strong>Account Details:</strong></p>
              <ul>
                <li>Email: ${user.email}</li>
                <li>Mobile: ${user.mobile}</li>
                <li>Project: ${user.project_name || 'N/A'}</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
        to: user.email,
        subject: 'Welcome to Dream Properties - Account Activated',
        html: builderEmailTemplate
      });

      // Notify admins
      const adminNotificationTemplate = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #334155;">
          <div style="max-width: 600px; margin: 20px auto; padding: 24px;">
            <h2>New Builder Registration</h2>
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>New builder has signed up:</strong></p>
              <ul>
                <li><strong>Name:</strong> ${user.name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Mobile:</strong> ${user.mobile}</li>
                <li><strong>Project:</strong> ${user.project_name || 'N/A'}</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `;

      if (process.env.SUPER_ADMIN_EMAIL) {
        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: process.env.SUPER_ADMIN_EMAIL,
          subject: `New Builder Registration: ${user.name}`,
          html: adminNotificationTemplate
        });
      }

      const [admins] = await pool.query('SELECT email FROM users WHERE role = "ADMIN" AND status = "Active"');
      for (const admin of admins) {
        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: admin.email,
          subject: `New Builder Registration: ${user.name}`,
          html: adminNotificationTemplate
        });
      }
    }

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
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'Your account has been disabled. Please contact support.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const responseUser = { ...user };
    delete responseUser.password;

    res.json({
      message: 'Login successful',
      user: responseUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Dream Properties API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      profile: '/api/profile/*',
      properties: '/api/superadmin/*',
      builder: '/api/builder/*'
    }
  });
});

// Export for Vercel Serverless
export default app;
