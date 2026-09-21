export default function QuizBoard({ gameState, makeMove }) {
  if (gameState.type !== 'quiz') return null;

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        {gameState.players.map(p => (
          <div key={p.userId} style={{ padding: '1rem', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', width: '45%', textAlign: 'center' }}>
            <h4>User {p.userId}</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.score}</p>
          </div>
        ))}
      </div>

      {gameState.question ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--border)' }}>Round {gameState.round}</h3>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>{gameState.question.q}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {gameState.question.options.map(opt => (
              <button 
                key={opt}
                className="btn" 
                onClick={() => makeMove(opt)}
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--primary)', color: 'var(--text)' }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <h3 style={{ textAlign: 'center' }}>Waiting for next question...</h3>
      )}
    </div>
  );
}
