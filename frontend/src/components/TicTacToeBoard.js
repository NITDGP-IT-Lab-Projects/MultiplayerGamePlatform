export default function TicTacToeBoard({ gameState, makeMove }) {
  if (!gameState.board) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ marginBottom: '1rem' }}>Turn: {gameState.players && gameState.players[gameState.turn] ? `User ${gameState.players[gameState.turn].userId} (${gameState.players[gameState.turn].symbol})` : '...'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '10px' }}>
        {gameState.board.map((cell, index) => (
          <div 
            key={index} 
            onClick={() => makeMove(index)}
            style={{
              width: '100px', height: '100px', backgroundColor: 'var(--card)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '3rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px',
              border: '2px solid var(--border)'
            }}
          >
            {cell}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
        {gameState.players && gameState.players.map(p => (
          <div key={p.userId} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <p><strong>User {p.userId}</strong></p>
            <p>Symbol: {p.symbol}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
