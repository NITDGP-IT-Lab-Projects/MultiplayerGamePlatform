-- init.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    team_id INT REFERENCES teams(id),
    user_id INT REFERENCES users(id),
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    schema JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_scores (
    user_id INT REFERENCES users(id),
    game_id INT REFERENCES games(id),
    score INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    PRIMARY KEY (user_id, game_id)
);

INSERT INTO games (id, name, type, schema) VALUES 
(1, 'Tic-Tac-Toe', 'board', '{"grid": 3, "win_condition": "line"}'),
(2, 'Quiz Game', 'trivia', '{"rounds": 3, "timer": 15}'),
(3, 'Word Formation', 'puzzle', '{"letters": 10, "timer": 60}'),
(4, 'Crossword Puzzle', 'puzzle', '{"size": 10}');

