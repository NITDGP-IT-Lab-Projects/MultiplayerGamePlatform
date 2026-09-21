const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

const pool = new Pool({
  user: process.env.DB_USER || 'game_user',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'game_platform',
  password: process.env.DB_PASSWORD || 'game_password',
  port: process.env.DB_PORT || 5432,
});

app.post('/api/games/upload', async (req, res) => {
  const { name, type, schema } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO games (name, type, schema) VALUES ($1, $2, $3) RETURNING *',
      [name, type, schema] // schema is expected to be a JSON object
    );
    res.status(201).json({ game: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Game name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, type, created_at FROM games');
    res.json({ games: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Game not found' });
    res.json({ game: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Game Service running on port ${PORT}`);
});
