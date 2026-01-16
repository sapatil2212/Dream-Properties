import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../authMiddleware.js';

const router = express.Router();

// Middleware to check if user is Builder
const isBuilder = (req, res, next) => {
  if (req.user && req.user.role === 'BUILDER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Builder privileges required.' });
  }
};

// 1. Post a new property (Builder)
router.post('/post', authenticateToken, isBuilder, async (req, res) => {
  const {
    title, description, price, area, location, address, type,
    bedrooms, bathrooms, possession_date, rera_id,
    amenities, images, highlights, specifications,
    project_units, project_area, configurations,
    avg_price, launch_date, sizes, project_size, area_unit,
    map_link, nearby_locations, attachments, listing_type, property_subtype
  } = req.body;

  try {
    const [result] = await pool.query(`
      INSERT INTO properties (
        builder_id, title, description, price, area, location, address, type,
        bedrooms, bathrooms, possession_date, rera_id,
        amenities, images, highlights, specifications,
        project_units, project_area, configurations,
        avg_price, launch_date, sizes, project_size, area_unit,
        map_link, nearby_locations, attachments, status, listing_type, property_subtype
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Approval', ?, ?)
    `, [
      req.user.id, title, description, price, area, location, address, type,
      bedrooms, bathrooms, possession_date, rera_id,
      JSON.stringify(amenities), JSON.stringify(images), JSON.stringify(highlights), JSON.stringify(specifications),
      project_units, project_area, configurations,
      avg_price, launch_date, sizes, project_size, area_unit,
      map_link, JSON.stringify(nearby_locations), JSON.stringify(attachments),
      listing_type || 'Sell',
      property_subtype || null
    ]);

    res.status(201).json({ message: 'Property submitted for approval', propertyId: result.insertId });
  } catch (error) {
    console.error('Post property error:', error);
    res.status(500).json({ message: 'Failed to post property' });
  }
});

// 2. Get builder's own properties
router.get('/my-properties', authenticateToken, isBuilder, async (req, res) => {
  try {
    const [properties] = await pool.query(
      'SELECT * FROM properties WHERE builder_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(properties);
  } catch (error) {
    console.error('Fetch builder properties error:', error);
    res.status(500).json({ message: 'Failed to fetch your properties' });
  }
});

// 3. Delete builder's own property
router.delete('/delete-property/:id', authenticateToken, isBuilder, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verify the property belongs to this builder
    const [properties] = await pool.query('SELECT builder_id FROM properties WHERE id = ?', [id]);
    
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (properties[0].builder_id !== userId) {
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
