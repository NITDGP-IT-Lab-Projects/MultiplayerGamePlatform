const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const pool = new Pool({
  user: process.env.DB_USER || 'game_user',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'game_platform',
  password: process.env.DB_PASSWORD || 'game_password',
  port: process.env.DB_PORT || 5432,
});

const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function updateScore(userId, gameId, result) {
  if (!userId) return;
  // Upsert pattern
  const check = await pool.query('SELECT * FROM user_scores WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
  if (check.rows.length === 0) {
    await pool.query('INSERT INTO user_scores (user_id, game_id) VALUES ($1, $2)', [userId, gameId]);
  }

  if (result === 'win') {
    await pool.query('UPDATE user_scores SET score = score + 10, wins = wins + 1 WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
  } else if (result === 'loss') {
    await pool.query('UPDATE user_scores SET score = GREATEST(score - 5, 0), losses = losses + 1 WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
  } else if (result === 'draw') {
    await pool.query('UPDATE user_scores SET score = score + 2, draws = draws + 1 WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
  }
}

async function start() {
  await redisClient.connect();
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe('game_completed', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received game_completed event:', data);
      
      const gameId = data.gameId || 1; // Default to 1 for MVP if missing

      if (data.isDraw) {
        await updateScore(data.player1Id, gameId, 'draw');
        await updateScore(data.player2Id, gameId, 'draw');
      } else {
        await updateScore(data.winnerId, gameId, 'win');
        await updateScore(data.loserId, gameId, 'loss');
      }
    } catch (err) {
      console.error('Error processing event:', err);
    }
  });

  app.get('/api/analytics/leaderboards/:gameId', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.username, s.score, s.wins, s.losses, s.draws 
        FROM user_scores s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.game_id = $1 
        ORDER BY s.score DESC 
        LIMIT 10
      `, [req.params.gameId]);
      res.json({ leaderboard: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Analytics Service running on port ${PORT}`);
  });
}

start();
