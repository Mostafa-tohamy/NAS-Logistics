const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Campaign {
  static async create(campaignData) {
    const id = uuidv4();
    const {
      name,
      description,
      channels,
      segment,
      content,
      scheduled_at,
      status
    } = campaignData;

    const query = `
      INSERT INTO campaigns
      (id, name, description, channels, segment, content, scheduled_at, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      name,
      description,
      JSON.stringify(channels),
      segment,
      JSON.stringify(content),
      scheduled_at,
      status || 'draft'
    ]);

    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM campaigns WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0, status = null) {
    let query = 'SELECT * FROM campaigns';
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

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'content' || key === 'channels') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE campaigns
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE campaigns
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM campaigns WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Campaign;
