const express = require('express');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    const notifications = await Notification.getAll(parseInt(limit), parseInt(offset), status);
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customer/:customerId', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.getByCustomer(req.params.customerId);
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaign/:campaignId', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.getByCampaign(req.params.campaignId);
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const notification = await Notification.updateStatus(req.params.id, status);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({
      success: true,
      message: 'Notification status updated',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
