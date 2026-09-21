// Simple 5x5 Crossword
//   0 1 2 3 4
// 0 H E L L O
// 1   X
// 2 W O R L D
// 3   X
// 4   X
const layout = [
  ['H', 'E', 'L', 'L', 'O'],
  ['', 'X', '', '', ''],
  ['E', 'A', 'R', 'T', 'H'],
  ['', 'X', '', '', ''],
  ['', 'X', '', '', '']
];
const clues = [
  { id: 1, direction: 'across', row: 0, col: 0, length: 5, hint: 'A greeting', answer: 'HELLO', solvedBy: null },
  { id: 2, direction: 'across', row: 2, col: 0, length: 5, hint: 'Our planet', answer: 'EARTH', solvedBy: null }
];

function initCrosswordGame(sessionId, players, io, redisClient) {
  const game = {
    type: 'crossword',
    gameId: 4,
    players: players.map(p => ({ ...p, score: 0 })),
    clues: JSON.parse(JSON.stringify(clues)),
    board: layout.map(row => row.map(cell => cell === 'X' ? 'X' : ''))
  };

  const broadcastState = () => {
    io.to(sessionId).emit('state_update', { 
      state: { 
        type: 'crossword', 
        board: game.board,
        clues: game.clues,
        players: game.players
      }
    });
  };

  const handleMove = (socketId, move) => {
    // move = { clueId, answer }
    const player = game.players.find(p => p.socketId === socketId);
    if (!player) return;

    const clue = game.clues.find(c => c.id === move.clueId);
    if (clue && !clue.solvedBy && move.answer.toUpperCase() === clue.answer) {
      clue.solvedBy = player.userId;
      player.score += 10;
      
      // Update board
      for (let i = 0; i < clue.length; i++) {
        if (clue.direction === 'across') game.board[clue.row][clue.col + i] = clue.answer[i];
        else game.board[clue.row + i][clue.col] = clue.answer[i];
      }

      broadcastState();

      if (game.clues.every(c => c.solvedBy)) {
        endGame(game, sessionId, io, redisClient);
      }
    }
  };

  setTimeout(broadcastState, 1000);

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

module.exports = { initCrosswordGame };
