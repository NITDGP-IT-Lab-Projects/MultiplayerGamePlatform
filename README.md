# Multi-player Game Platform

A scalable, event-driven, microservices-based online multi-player game platform.

## Features
- **Microservices Architecture**: Separate services for Users, Game Management, Game Engine, Analytics, and an API Gateway.
- **Event-Driven Backend**: Redis Pub/Sub handles game completion events asynchronously.
- **Real-Time Gameplay**: WebSockets (Socket.io) used for matchmaking and low-latency gameplay synchronization.
- **Next.js Frontend**: A modern, interactive dark-themed UI.
- **Available Games**: Tic-Tac-Toe, Quiz Game, Word Formation, and Crossword Puzzle.

## Architecture Stack
- **Frontend**: Next.js, React, Vanilla CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL
- **Message Broker & Cache**: Redis
- **Infrastructure**: Docker Compose

## Getting Started

### Prerequisites
- Docker Desktop installed and running.
- Node.js installed (for running the frontend locally).

### 1. Start the Backend Services
Use Docker Compose to spin up the databases and all microservices.
```bash
docker-compose up --build
```
*This starts the API Gateway on port `3000`, along with PostgreSQL and Redis.*

### 2. Start the Frontend
In a separate terminal, navigate to the frontend directory and start the Next.js development server.
```bash
cd frontend
npm install
npm run dev
```
*Note: Since the API Gateway runs on port 3000, Next.js will automatically launch on port `3001` or another available port.*

### 3. Play!
Open the frontend URL (e.g., `http://localhost:3001`) in two different browser windows. Register two separate users, select a game from the lobby, and start playing!

---

## Detailed Architecture & Working

### 1. High-Level Architecture
The platform is composed of several independent services that communicate with each other. It uses **Docker Compose** (`docker-compose.yml`) to orchestrate the entire environment, which includes:
- **Frontend**: A Next.js application for the user interface.
- **Backend Microservices**: Four distinct Node.js/Express services (API Gateway, User, Game, Engine, Analytics).
- **PostgreSQL**: The primary relational database for storing users, game metadata, and scores.
- **Redis**: Acts as a message broker for pub/sub (publish-subscribe) communication between services, enabling asynchronous event handling.

### 2. The Microservices Breakdown

#### **API Gateway** (`api-gateway`)
- **Role**: This is the entry point for all HTTP requests from the frontend. Running on port `3000`, it acts as a reverse proxy using `http-proxy-middleware`. 
- **Routing**: It forwards incoming requests to the appropriate internal microservice:
  - `/api/users` and `/api/teams` → **User Service**
  - `/api/games` → **Game Service**
  - `/api/analytics` → **Analytics Service**

#### **User Service** (`user-service`)
- **Role**: Manages user identity and authentication.
- **Working**: Exposes endpoints to register new users (hashing passwords using `bcrypt`) and log them in (generating JWTs). Handles team creation, interacting directly with the `users`, `teams`, and `team_members` tables.

#### **Game Service** (`game-service`)
- **Role**: Manages the metadata of games available on the platform.
- **Working**: Provides endpoints to upload new game definitions and fetch the list of available games. Interacts with the `games` table, which is pre-populated with games like Tic-Tac-Toe, Quiz Game, Word Formation, and Crossword Puzzle.

#### **Engine Service** (`engine-service`)
- **Role**: The core of the real-time gameplay. This service runs a **Socket.io** WebSocket server on port `3003`.
- **Working**: 
  - **Matchmaking**: Users join a lobby for a specific game. When two users queue for the same game, the engine creates a unique session and pairs them up.
  - **Gameplay**: Loads specific game logic from the `games/` directory. As players make moves on the frontend, `make_move` events are sent over the WebSocket to this service to update the game state.
  - **Event Emitting**: When a game finishes (win/loss/draw), it publishes a `game_completed` event containing the match results to a **Redis channel**.

#### **Analytics Service** (`analytics-service`)
- **Role**: Handles game statistics and leaderboards asynchronously.
- **Working**: Listens for the `game_completed` event published by the Engine Service via Redis Pub/Sub. Upon receiving this event, it calculates new scores and updates the `user_scores` table in PostgreSQL. It also provides a REST endpoint for leaderboards.

### 3. The Data Flow Lifecycle (Example: Playing a Game)
1. **Login**: User logs in via the Frontend. The request passes through the API Gateway to the User Service, returning a JWT.
2. **Lobby**: User selects a game and joins the lobby. Frontend establishes a WebSocket connection with the Engine Service.
3. **Matchmaking**: Engine Service waits until a second player joins. It then creates a game session and notifies both players via WebSockets.
4. **Playing**: Players make moves on the UI. The Frontend sends `make_move` WebSocket events to the Engine Service, which updates and broadcasts the new state.
5. **Game Over**: Engine Service determines the win condition, sends a `game_over` WebSocket event to both players, and publishes a `game_completed` message to Redis.
6. **Analytics Update**: The Analytics Service receives the `game_completed` message via Redis and asynchronously updates scores and statistics in the database.
