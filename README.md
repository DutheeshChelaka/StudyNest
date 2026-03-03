# 📚 StudyNest

**Real-Time Virtual Study Room Platform**

A real-time virtual study room platform where students join focus sessions together, track productivity with shared Pomodoro timers, chat, and compete on study leaderboards.

Built with Next.js 14 · NestJS · Socket.io · PostgreSQL · Redis

---

## Features

- **Virtual Study Rooms** — Create or join public/private rooms organized by subject with real-time presence tracking
- **Shared Pomodoro Timer** — Server-synchronized focus timer visible to all room members
- **Real-Time Chat** — In-room messaging with typing indicators, file sharing, image uploads, and emoji reactions
- **Leaderboard & Achievements** — Daily, weekly, and all-time rankings with milestone badges
- **Smart Room Matching** — Priority queue algorithm recommends the best room based on subject, friends, and occupancy
- **Search Autocomplete** — Trie-based instant search for rooms and users
- **Friend Recommendations** — BFS graph traversal suggests study partners from your social network

---

## Architecture
```
Next.js 14 (Frontend)
    ├── REST API (HTTP) ──→ NestJS Backend ──→ PostgreSQL
    └── WebSocket (WS) ──→ Socket.io Server ──→ Redis
```

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Zustand, Socket.io-client
- **Backend:** NestJS, Prisma ORM, Socket.io, JWT + Google OAuth
- **Database:** PostgreSQL (persistent data), Redis (real-time state, leaderboard, presence)
- **DevOps:** Docker Compose, GitHub Actions CI/CD

---

## Data Structures & Algorithms

| Algorithm | Use Case | Complexity |
|-----------|----------|------------|
| Max-Heap Priority Queue | Smart room matching (Quick Join) | O(log n) insert/extract |
| Trie (Prefix Tree) | Search autocomplete | O(m) prefix search |
| BFS Graph Traversal | Friend recommendations | O(V + E) traversal |
| Redis Sorted Sets | Real-time leaderboard | O(log n) rank updates |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL & Redis)
- Google OAuth credentials (Google Cloud Console)

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/DutheeshChelaka/StudyNest.git
cd StudyNest
```

2. **Start databases**
```bash
docker-compose up -d postgres redis
```

3. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env    # Fill in your credentials
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

4. **Frontend setup**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

5. **Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /auth/google | Google OAuth login |
| GET | /auth/me | Current user profile |
| POST | /auth/refresh | Refresh access token |
| PATCH | /users/profile | Update profile |
| GET | /users/search | Search users |
| POST | /rooms | Create room |
| GET | /rooms | List public rooms |
| GET | /rooms/quick-join | Smart room matching |
| GET | /rooms/:id | Room details |
| POST | /rooms/:id/join | Join room |
| POST | /rooms/:id/leave | Leave room |
| POST | /chat/upload | Upload file |
| GET | /leaderboard | Top users |
| GET | /leaderboard/me | My rank |
| GET | /leaderboard/achievements | My achievements |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| room:join | Client → Server | Join a study room |
| room:leave | Client → Server | Leave a room |
| room:members | Server → Client | Updated member list |
| chat:send | Client → Server | Send message |
| chat:receive | Server → Room | Broadcast message |
| chat:react | Client → Server | React to message |
| timer:start | Client → Server | Start Pomodoro |
| timer:tick | Server → Room | Timer sync (every second) |
| timer:complete | Server → Room | Focus/break ended |
| achievement:unlocked | Server → Room | New achievement earned |

---

## Testing
```bash
cd backend
npx jest              # Run all 53 unit tests
npx jest --coverage   # With coverage report
```

---

## Deployment

- **Frontend:** Vercel (auto-deploy on push to main)
- **Backend:** Railway / AWS EC2 with Docker
- **CI/CD:** GitHub Actions runs tests on every PR

---

## Tech Stack

Next.js 14 · NestJS · TypeScript · Socket.io · PostgreSQL · Prisma · Redis · Tailwind CSS · Zustand · Docker · GitHub Actions · Google OAuth · JWT

---

## Author

**Dutheesh C. Karunarathne** — SLIIT undergraduate

Built with the goal of making studying less lonely.