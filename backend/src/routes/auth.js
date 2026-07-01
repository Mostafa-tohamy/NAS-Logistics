const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const pool = require('../config/database');
const { validateEmail } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateEmail, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const query = `
      INSERT INTO users (email, password, name, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, email, name;
    `;

    const result = await pool.query(query, [email, hashedPassword, name]);
    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', validateEmail, async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { id: user.id, email: user.email, name: user.name }, token }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
