const express = require('express');
const Campaign = require('../models/Campaign');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const { authenticate } = require('../middleware/auth');
const { sendCampaign } = require('../services/campaignService');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    const campaigns = await Campaign.getAll(parseInt(limit), parseInt(offset), status);
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    const notifications = await Notification.getByCampaign(req.params.id);
    res.json({
      success: true,
      data: {
        ...campaign,
        notifications: notifications
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.update(req.params.id, req.body);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/send', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ error: 'Campaign already sent' });
    }

    const customers = await Customer.getBySegment(campaign.segment);
    const results = await sendCampaign(campaign, customers);

    await Campaign.updateStatus(req.params.id, 'sent');

    res.json({
      success: true,
      message: `Campaign sent to ${results.length} customers`,
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.delete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
