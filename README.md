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
