const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/campaigns/:campaignId', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_sent,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN status = 'clicked' THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        type as channel
      FROM notifications
      WHERE campaign_id = $1
      GROUP BY channel;
    `;

    const result = await pool.query(query, [req.params.campaignId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/engagement/overview', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_notifications,
        COUNT(DISTINCT campaign_id) as total_campaigns,
        COUNT(DISTINCT customer_id) as total_customers,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 2) as delivery_rate
      FROM notifications
      WHERE created_at > NOW() - INTERVAL '30 days';
    `;

    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/segments/engagement', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        c.segment,
        COUNT(DISTINCT n.customer_id) as customers,
        COUNT(n.id) as notifications_sent,
        SUM(CASE WHEN n.status = 'delivered' THEN 1 ELSE 0 END) as delivered
      FROM customers c
      LEFT JOIN notifications n ON c.id = n.customer_id
      GROUP BY c.segment;
    `;

    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
