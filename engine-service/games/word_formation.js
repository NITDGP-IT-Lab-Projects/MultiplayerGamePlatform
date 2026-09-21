const dictionary = new Set(["CAT", "DOG", "GOD", "ACT", "COT", "DOT", "COG", "TAG"]);
const lettersPool = "ACTDOG";

function initWordGame(sessionId, players, io, redisClient) {
  const game = {
    type: 'word_formation',
    gameId: 3,
    players: players.map(p => ({ ...p, score: 0, words: [] })),
    letters: lettersPool.split('').sort(() => 0.5 - Math.random()).join(''),
    endTime: Date.now() + 60000 // 60 seconds
  };

  const timer = setInterval(() => {
    if (Date.now() >= game.endTime) {
      clearInterval(timer);
      endGame(game, sessionId, io, redisClient);
    } else {
      io.to(sessionId).emit('state_update', { 
        state: { 
          type: 'word_formation', 
          letters: game.letters, 
          players: game.players,
          timeLeft: Math.round((game.endTime - Date.now()) / 1000)
        }
      });
    }
  }, 1000);

  const handleMove = (socketId, word) => {
    const player = game.players.find(p => p.socketId === socketId);
    if (!player) return;

    word = word.toUpperCase();
    if (!player.words.includes(word) && dictionary.has(word)) {
      player.words.push(word);
      player.score += word.length;
    }
  };

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

module.exports = { initWordGame };
