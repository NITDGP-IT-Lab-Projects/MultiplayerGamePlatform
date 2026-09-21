'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

import TicTacToeBoard from '../../../components/TicTacToeBoard';
import QuizBoard from '../../../components/QuizBoard';
import WordBoard from '../../../components/WordBoard';
import CrosswordBoard from '../../../components/CrosswordBoard';

export default function GameRoom({ params }) {
  const gameId = parseInt(params.gameId, 10);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('Idle');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));

    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Connected to game engine'));

    newSocket.on('lobby_ready', (data) => {
      setSessionId(data.sessionId);
      setGameState(data.state);
      setStatus('Game Started!');
    });

    newSocket.on('state_update', (data) => {
      setGameState(data.state);
    });

    newSocket.on('game_over', (data) => {
      setGameState(prev => ({ ...prev, ...data }));
      if (data.winnerId === null) {
        setStatus('Game Over - Draw!');
      } else {
        setStatus(`Game Over - User ${data.winnerId} Wins!`);
      }
    });

    return () => newSocket.close();
  }, [router]);

  const joinLobby = () => {
    if (socket && user) {
      setStatus('Searching for opponent...');
      socket.emit('join_lobby', { userId: user.id, gameId });
    }
  };

  const leaveGame = () => {
    if (socket && sessionId) socket.emit('leave_game', { sessionId });
    setGameState(null);
    setSessionId(null);
    setStatus('Idle');
    router.push('/game');
  };

  const makeMove = (movePayload) => {
    if (socket && sessionId) {
      socket.emit('make_move', { sessionId, move: movePayload });
    }
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome, {user?.username}</h2>
        <div>
          <button className="btn" onClick={() => router.push('/game')} style={{ marginRight: '1rem', backgroundColor: 'var(--card)' }}>Back to Lobby</button>
          <button className="btn" onClick={() => {
            localStorage.clear();
            router.push('/');
          }}>Logout</button>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3>Status: {status}</h3>
        {!sessionId && <button className="btn" onClick={joinLobby} style={{ marginTop: '1rem' }}>Find Match</button>}
        {status.startsWith('Game Over') && <button className="btn" onClick={leaveGame} style={{ marginTop: '1rem', marginLeft: '1rem' }}>Leave Room</button>}
      </div>

      {gameState && sessionId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {gameId === 1 && <TicTacToeBoard gameState={gameState} makeMove={makeMove} user={user} />}
          {gameId === 2 && <QuizBoard gameState={gameState} makeMove={makeMove} user={user} />}
          {gameId === 3 && <WordBoard gameState={gameState} makeMove={makeMove} user={user} />}
          {gameId === 4 && <CrosswordBoard gameState={gameState} makeMove={makeMove} user={user} />}
        </div>
      )}
    </main>
  );
}
