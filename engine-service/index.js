const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const cors = require('cors');
require('dotenv').config();

const { initTicTacToe } = require('./games/tic_tac_toe');
const { initQuizGame } = require('./games/quiz');
const { initWordGame } = require('./games/word_formation');
const { initCrosswordGame } = require('./games/crossword');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3003;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

let matchmakingQueue = [];
let activeGames = {}; // sessionId -> { game, handleMove }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_lobby', ({ userId, gameId }) => {
    gameId = parseInt(gameId, 10);
    console.log(`User ${userId} joined lobby for game ${gameId}`);
    
    // Prevent double-queuing by the same user/socket
    matchmakingQueue = matchmakingQueue.filter(p => p.userId !== userId && p.socketId !== socket.id);
    matchmakingQueue.push({ socketId: socket.id, userId, gameId });
    
    const sameGameQueue = matchmakingQueue.filter(p => p.gameId === gameId);
    if (sameGameQueue.length >= 2) {
      const p1 = sameGameQueue[0];
      const p2 = sameGameQueue[1];
      
      matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== p1.socketId && p.socketId !== p2.socketId);
      
      const sessionId = `session_${Date.now()}`;
      const players = [{ socketId: p1.socketId, userId: p1.userId }, { socketId: p2.socketId, userId: p2.userId }];
      
      let gameInstance;
      if (gameId === 1) gameInstance = initTicTacToe(sessionId, players, io, redisClient);
      else if (gameId === 2) gameInstance = initQuizGame(sessionId, players, io, redisClient);
      else if (gameId === 3) gameInstance = initWordGame(sessionId, players, io, redisClient);
      else if (gameId === 4) gameInstance = initCrosswordGame(sessionId, players, io, redisClient);
      else return; // invalid game

      activeGames[sessionId] = gameInstance;

      // Join sockets to the room securely
      io.in(p1.socketId).socketsJoin(sessionId);
      io.in(p2.socketId).socketsJoin(sessionId);

      io.to(sessionId).emit('lobby_ready', { sessionId, state: gameInstance.game });
    }
  });

  socket.on('make_move', async ({ sessionId, move }) => {
    const instance = activeGames[sessionId];
    if (!instance) return;
    
    instance.handleMove(socket.id, move);

    // Clean up if game is over (handleMove would have emitted game_over and published to redis)
    // We can't immediately delete because handleMove might be async or timed.
    // In a real app, the game engine should emit an event or return a boolean to indicate game over.
    // For this MVP, we assume games that end call io.to(sessionId).emit('game_over')
    // We'll add a cleanup listener instead.
  });

  socket.on('leave_game', ({ sessionId }) => {
    if (activeGames[sessionId]) delete activeGames[sessionId];
  });

  socket.on('disconnect', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
    console.log('User disconnected:', socket.id);
  });
});

async function start() {
  await redisClient.connect();
  server.listen(PORT, () => {
    console.log(`Engine Service running on port ${PORT}`);
  });
}

start();
