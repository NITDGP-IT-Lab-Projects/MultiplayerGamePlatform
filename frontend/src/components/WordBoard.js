import { useState } from 'react';

export default function WordBoard({ gameState, makeMove }) {
  const [inputWord, setInputWord] = useState('');
  
  if (gameState.type !== 'word_formation') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputWord.trim()) {
      makeMove(inputWord.trim());
      setInputWord('');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        {gameState.players.map(p => (
          <div key={p.userId} style={{ padding: '1rem', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', width: '30%', textAlign: 'center' }}>
            <h4>User {p.userId}</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.score}</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--border)' }}>
              {p.words && p.words.join(', ')}
            </div>
          </div>
        ))}

        <div style={{ padding: '1rem', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--primary)', width: '30%', textAlign: 'center' }}>
          <h4>Time Left</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{gameState.timeLeft}s</p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Form words using these letters:</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {gameState.letters && gameState.letters.split('').map((letter, i) => (
            <div key={i} style={{ 
              width: '50px', height: '50px', backgroundColor: 'var(--bg)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              fontSize: '2rem', fontWeight: 'bold', borderRadius: '8px', border: '1px solid var(--primary)' 
            }}>
              {letter}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <input 
            type="text" 
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value.toUpperCase())}
            placeholder="Type a word..."
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', fontSize: '1.2rem', width: '300px' }}
          />
          <button type="submit" className="btn">Submit</button>
        </form>
      </div>
    </div>
  );
}
