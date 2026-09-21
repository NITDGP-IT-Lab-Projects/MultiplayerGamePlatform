import { useState } from 'react';

export default function CrosswordBoard({ gameState, makeMove }) {
  const [selectedClue, setSelectedClue] = useState(null);
  const [answerInput, setAnswerInput] = useState('');

  if (gameState.type !== 'crossword') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedClue && answerInput.trim()) {
      makeMove({ clueId: selectedClue.id, answer: answerInput.trim() });
      setAnswerInput('');
      setSelectedClue(null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem' }}>
      
      {/* Board Column */}
      <div style={{ flex: 1 }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 50px)', gap: '4px' }}>
            {gameState.board.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div key={`${rIdx}-${cIdx}`} style={{
                  width: '50px', height: '50px',
                  backgroundColor: cell === 'X' ? '#000' : (cell === '' ? 'var(--bg)' : 'var(--primary)'),
                  border: cell === 'X' ? 'none' : '1px solid var(--border)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '1.5rem', fontWeight: 'bold', color: 'white'
                }}>
                  {cell !== 'X' ? cell : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clues Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {gameState.players.map(p => (
            <div key={p.userId} style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <h4>User {p.userId}</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.score} pts</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Clues</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {gameState.clues.map(c => (
              <li 
                key={c.id} 
                onClick={() => !c.solvedBy && setSelectedClue(c)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid var(--border)', 
                  marginBottom: '0.5rem', 
                  borderRadius: '8px',
                  backgroundColor: c.solvedBy ? '#166534' : (selectedClue?.id === c.id ? 'var(--primary)' : 'var(--bg)'),
                  cursor: c.solvedBy ? 'default' : 'pointer',
                  opacity: c.solvedBy ? 0.7 : 1
                }}
              >
                <strong>{c.id} {c.direction}:</strong> {c.hint} ({c.length} letters)
                {c.solvedBy && <span style={{ float: 'right', fontSize: '0.8rem' }}>Solved by User {c.solvedBy}</span>}
              </li>
            ))}
          </ul>
        </div>

        {selectedClue && (
          <div className="card">
            <h4>Answering Clue: {selectedClue.hint}</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input 
                type="text" 
                maxLength={selectedClue.length}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value.toUpperCase())}
                placeholder={`Type ${selectedClue.length} letters...`}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', fontSize: '1rem' }}
              />
              <button type="submit" className="btn">Submit</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
