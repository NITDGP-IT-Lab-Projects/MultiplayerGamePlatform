const questions = [
  { q: "What is the capital of France?", a: "Paris", options: ["London", "Paris", "Berlin", "Madrid"] },
  { q: "What is 2 + 2?", a: "4", options: ["3", "4", "5", "6"] },
  { q: "Who wrote Hamlet?", a: "Shakespeare", options: ["Dickens", "Shakespeare", "Hemingway", "Tolkien"] }
];

function initQuizGame(sessionId, players, io, redisClient) {
  const game = {
    type: 'quiz',
    gameId: 2,
    players: players.map(p => ({ ...p, score: 0 })),
    currentRound: 0,
    maxRounds: 3,
    answers: 0,
    startTime: Date.now()
  };

  const nextRound = () => {
    if (game.currentRound >= game.maxRounds) {
      endGame(game, sessionId, io, redisClient);
      return;
    }
    const question = questions[game.currentRound];
    game.answers = 0;
    io.to(sessionId).emit('state_update', { 
      state: { 
        type: 'quiz', 
        question: { q: question.q, options: question.options }, 
        players: game.players,
        round: game.currentRound + 1
      }
    });
  };

  const handleMove = (socketId, answer) => {
    const player = game.players.find(p => p.socketId === socketId);
    if (!player) return;
    
    if (answer === questions[game.currentRound].a) {
      player.score += 10;
    }
    game.answers += 1;

    if (game.answers >= game.players.length) {
      game.currentRound++;
      setTimeout(nextRound, 2000); // Wait 2s before next round
    }
  };

  setTimeout(nextRound, 1000);

  return { game, handleMove };
}

function endGame(game, sessionId, io, redisClient) {
  game.players.sort((a, b) => b.score - a.score);
  const winner = game.players[0];
  const loser = game.players[1];
  let isDraw = winner.score === loser.score;
  
  io.to(sessionId).emit('game_over', { 
    winnerId: isDraw ? null : winner.userId, 
    players: game.players
  });

  redisClient.publish('game_completed', JSON.stringify({
    gameId: game.gameId,
    winnerId: isDraw ? null : winner.userId,
    loserId: isDraw ? null : loser.userId,
    isDraw,
    player1Id: winner.userId,
    player2Id: loser.userId
  }));
}

module.exports = { initQuizGame };
