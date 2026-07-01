const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Customer {
  static async create(customerData) {
    const id = uuidv4();
    const {
      first_name,
      last_name,
      email,
      phone,
      company_name,
      segment,
      preferences
    } = customerData;

    const query = `
      INSERT INTO customers
      (id, first_name, last_name, email, phone, company_name, segment, preferences, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      first_name,
      last_name,
      email,
      phone,
      company_name,
      segment || 'standard',
      JSON.stringify(preferences || { email: true, sms: false, push: false })
    ]);

    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM customers WHERE email = $1;';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0, segment = null) {
    let query = 'SELECT * FROM customers';
    const params = [];

    if (segment) {
      query += ' WHERE segment = $1';
      params.push(segment);
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
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updatePreferences(id, preferences) {
    const query = `
      UPDATE customers
      SET preferences = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [JSON.stringify(preferences), id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM customers WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getBySegment(segment) {
    const query = 'SELECT * FROM customers WHERE segment = $1;';
    const result = await pool.query(query, [segment]);
    return result.rows;
  }
}

module.exports = Customer;
