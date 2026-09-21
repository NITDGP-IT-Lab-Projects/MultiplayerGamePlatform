const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

const pool = new Pool({
  user: process.env.DB_USER || 'game_user',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'game_platform',
  password: process.env.DB_PASSWORD || 'game_password',
  port: process.env.DB_PORT || 5432,
});

app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // unique violation
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/teams', async (req, res) => {
  const { name, userId } = req.body; // In real app, extract userId from JWT
  try {
    const result = await pool.query(
      'INSERT INTO teams (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    const teamId = result.rows[0].id;
    if (userId) {
      await pool.query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)', [teamId, userId]);
    }
    res.status(201).json({ team: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
