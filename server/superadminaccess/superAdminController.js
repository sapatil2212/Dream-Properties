import express from 'express';
import { pool } from '../db.js';
import { transporter } from '../mailer.js';
import { authenticateToken } from '../authMiddleware.js';

const router = express.Router();

// Middleware to check if user is Super Admin or Admin
const isSuperAdminOrAdmin = (req, res, next) => {
  // Check role from token - allow both SUPER_ADMIN and ADMIN
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// 1. Get all accounts category-wise
router.get('/accounts-summary', authenticateToken, isSuperAdminOrAdmin, async (req, res) => {
  try {
    const [allUsers] = await pool.query(
      'SELECT id, name, email, mobile, role, status, security_key, property_type, looking_to, project_name, property_address, created_at FROM users ORDER BY created_at DESC'
    );
    
    // Categorize users
    const summary = {
      total: allUsers.length,
      buyers: allUsers.filter(u => u.role === 'BUYER'),
      builders: allUsers.filter(u => u.role === 'BUILDER'),
      staff: allUsers.filter(u => ['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE'].includes(u.role)),
      others: allUsers.filter(u => !['BUYER', 'BUILDER', 'ADMIN', 'TELECALLER', 'SALES_EXECUTIVE'].includes(u.role))
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Fetch accounts summary error:', error);
    res.status(500).json({ message: 'Failed to fetch accounts summary' });
  }
});

// 2. Toggle user status (Enable/Disable)
router.post('/toggle-status', authenticateToken, isSuperAdminOrAdmin, async (req, res) => {
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

// 3. Send login credentials via email
router.post('/send-credentials', authenticateToken, isSuperAdminOrAdmin, async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    const emailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">Your Login Credentials</h2>
        <p>Hello <b>${user.name}</b>,</p>
        <p>Your account access details are provided below:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><b>Name:</b> ${user.name}</p>
          <p style="margin: 5px 0;"><b>Email ID:</b> ${user.email}</p>
          <p style="margin: 5px 0; font-size: 18px; color: #1e293b;"><b>Security Key for Login:</b> <span style="font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${user.security_key || 'N/A'}</span></p>
        </div>

        <p>Please use these details to access your dashboard.</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
          <p>© 2026 Dream Properties SaaS</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Dream Properties Admin" <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Access Credentials - Dream Properties',
      html: emailTemplate
    });

    res.json({ message: 'Credentials sent to ' + user.email });
  } catch (error) {
    console.error('Send credentials error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// 4. Get all properties for approval
router.get('/properties-for-approval', authenticateToken, isSuperAdminOrAdmin, async (req, res) => {
  try {
    const [properties] = await pool.query(`
      SELECT p.*, u.name as builder_name, u.email as builder_email 
      FROM properties p 
      JOIN users u ON p.builder_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(properties);
  } catch (error) {
    console.error('Fetch properties for approval error:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// 4b. Public endpoint - Get approved properties (no auth required)
router.get('/approved-properties', async (req, res) => {
  try {
    const { listing_type } = req.query;
    let query = `
      SELECT p.*, u.name as builder_name, u.email as builder_email 
      FROM properties p 
      JOIN users u ON p.builder_id = u.id 
      WHERE p.status = 'Approved'
    `;
    const queryParams = [];

    if (listing_type) {
      query += ` AND p.listing_type = ?`;
      queryParams.push(listing_type);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [properties] = await pool.query(query, queryParams);
    
    // Map builder_name to builder for frontend compatibility
    const formattedProperties = properties.map(p => ({
      ...p,
      builder: p.builder_name,
      pricePerSqft: p.price // Fallback if not available
    }));
    
    res.json(formattedProperties);
  } catch (error) {
    console.error('Fetch approved properties error:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// 4c. Public endpoint - Get single property by ID (no auth required)
router.get('/property/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [properties] = await pool.query(`
      SELECT p.*, u.name as builder_name, u.email as builder_email, u.mobile as builder_mobile 
      FROM properties p 
      JOIN users u ON p.builder_id = u.id 
      WHERE p.id = ? AND p.status = 'Approved'
    `, [id]);
    
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Map builder_name to builder for frontend compatibility
    const property = {
      ...properties[0],
      builder: properties[0].builder_name,
      pricePerSqft: properties[0].price // Fallback if not available
    };
    
    res.json(property);
  } catch (error) {
    console.error('Fetch property error:', error);
    res.status(500).json({ message: 'Failed to fetch property' });
  }
});

// 4d. Public endpoint - Search properties by keyword (no auth required)
router.get('/search-properties', async (req, res) => {
  try {
    const { q, listing_type, property_type } = req.query;
    
    let query = `
      SELECT p.*, u.name as builder_name, u.email as builder_email 
      FROM properties p 
      JOIN users u ON p.builder_id = u.id 
      WHERE p.status = 'Approved'
    `;
    const queryParams = [];

    // Add keyword search
    if (q && q.trim()) {
      query += ` AND (
        p.title LIKE ? OR 
        p.description LIKE ? OR 
        p.location LIKE ? OR 
        p.address LIKE ? OR
        p.type LIKE ? OR
        p.property_subtype LIKE ?
      )`;
      const searchTerm = `%${q.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add listing type filter
    if (listing_type) {
      query += ` AND p.listing_type = ?`;
      queryParams.push(listing_type);
    }

    // Add property type filter
    if (property_type && property_type !== 'all') {
      query += ` AND p.type = ?`;
      queryParams.push(property_type);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [properties] = await pool.query(query, queryParams);
    
    // Map builder_name to builder for frontend compatibility
    const formattedProperties = properties.map(p => ({
      ...p,
      builder: p.builder_name,
      pricePerSqft: p.price
    }));
    
    res.json(formattedProperties);
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({ message: 'Failed to search properties' });
  }
});

// 5. Approve/Reject property
router.post('/approve-property', authenticateToken, isSuperAdminOrAdmin, async (req, res) => {
  const { propertyId, status } = req.body; // status: 'Approved' or 'Rejected'

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await pool.query('UPDATE properties SET status = ? WHERE id = ?', [status, propertyId]);
    res.json({ message: `Property ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({ message: 'Failed to update property status' });
  }
});

// 6. Delete property (Admin, Super Admin, or Builder who created it)
router.delete('/delete-property/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Get property details to check ownership
    const [properties] = await pool.query('SELECT builder_id FROM properties WHERE id = ?', [id]);
    
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = properties[0];

    // Check authorization:
    // 1. Super Admin or Admin can delete any property
    // 2. Builder can only delete their own properties
    const isSuperAdminOrAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    const isOwner = property.builder_id === userId;

    if (!isSuperAdminOrAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own properties.' });
    }

    // Delete the property
    await pool.query('DELETE FROM properties WHERE id = ?', [id]);
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

export default router;
