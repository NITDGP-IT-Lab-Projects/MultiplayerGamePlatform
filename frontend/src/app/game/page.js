'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Lobby() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const games = [
    { id: 1, name: 'Tic-Tac-Toe', desc: 'Classic 3x3 board game.' },
    { id: 2, name: 'Quiz Game', desc: 'Test your knowledge!' },
    { id: 3, name: 'Word Formation', desc: 'Find words from letters.' },
    { id: 4, name: 'Crossword', desc: 'Solve clues together.' }
  ];

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome to the Lobby, {user?.username}</h2>
        <button className="btn" onClick={() => {
          localStorage.clear();
          router.push('/');
        }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {games.map(game => (
          <div key={game.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <h3>{game.name}</h3>
            <p style={{ color: 'var(--border)', textAlign: 'center' }}>{game.desc}</p>
            <button className="btn" onClick={() => router.push(`/game/${game.id}`)}>
              Play {game.name}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
