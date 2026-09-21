function checkWin(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function initTicTacToe(sessionId, players, io, redisClient) {
  const game = {
    type: 'tic_tac_toe',
    gameId: 1,
    players: [{ ...players[0], symbol: 'X' }, { ...players[1], symbol: 'O' }],
    turn: 0,
    board: Array(9).fill(null)
  };

  const broadcastState = () => {
    io.to(sessionId).emit('state_update', { state: game });
  };

  const handleMove = async (socketId, index) => {
    const currentPlayer = game.players[game.turn];
    if (socketId !== currentPlayer.socketId) return; // Not their turn
    if (game.board[index]) return; // Already filled

    game.board[index] = currentPlayer.symbol;
    
    const winnerSymbol = checkWin(game.board);
    if (winnerSymbol) {
      const winner = game.players.find(p => p.symbol === winnerSymbol);
      const loser = game.players.find(p => p.symbol !== winnerSymbol);
      io.to(sessionId).emit('game_over', { winnerId: winner.userId, board: game.board });
      
      await redisClient.publish('game_completed', JSON.stringify({
        gameId: game.gameId,
        winnerId: winner.userId,
        loserId: loser.userId,
        isDraw: false
      }));
    } else if (!game.board.includes(null)) {
      // Draw
      io.to(sessionId).emit('game_over', { winnerId: null, board: game.board });
      await redisClient.publish('game_completed', JSON.stringify({
        gameId: game.gameId,
        winnerId: null,
        loserId: null,
        isDraw: true,
        player1Id: game.players[0].userId,
        player2Id: game.players[1].userId
      }));
    } else {
      // Next turn
      game.turn = game.turn === 0 ? 1 : 0;
      broadcastState();
    }
  };

  return { game, handleMove };
}

module.exports = { initTicTacToe };
