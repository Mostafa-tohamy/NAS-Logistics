const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Notification {
  static async create(notificationData) {
    const id = uuidv4();
    const {
      customer_id,
      campaign_id,
      type,
      channel,
      subject,
      content,
      recipient,
      status,
      triggered_by,
      metadata
    } = notificationData;

    const query = `
      INSERT INTO notifications
      (id, customer_id, campaign_id, type, channel, subject, content, recipient, status, triggered_by, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      customer_id,
      campaign_id,
      type,
      channel,
      subject,
      content,
      recipient,
      status || 'pending',
      triggered_by,
      JSON.stringify(metadata || {})
    ]);

    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM notifications WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0, status = null) {
    let query = 'SELECT * FROM notifications';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE notifications
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async getByCampaign(campaignId) {
    const query = 'SELECT * FROM notifications WHERE campaign_id = $1 ORDER BY created_at DESC;';
    const result = await pool.query(query, [campaignId]);
    return result.rows;
  }

  static async getByCustomer(customerId) {
    const query = 'SELECT * FROM notifications WHERE customer_id = $1 ORDER BY created_at DESC;';
    const result = await pool.query(query, [customerId]);
    return result.rows;
  }
}

module.exports = Notification;
