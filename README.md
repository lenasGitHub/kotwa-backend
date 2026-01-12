# Steps (خُطوة) Backend API

A Node.js + TypeScript backend for the Steps social habit-tracking game.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database & apply schema
npm run db:push

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Server runs at: `http://localhost:3000`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Current user profile |
| GET | `/api/users/:id/stats` | Another user's stats |
| PUT | `/api/users/me` | Update profile |

### Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/challenges` | Create challenge |
| GET | `/api/challenges` | List challenges |
| GET | `/api/challenges/:id` | Challenge details |
| POST | `/api/challenges/:id/join` | Join challenge |
| POST | `/api/challenges/:id/leave` | Leave challenge |
| GET | `/api/challenges/:id/leaderboard` | Leaderboard |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create team |
| GET | `/api/teams` | List my teams |
| GET | `/api/teams/:id` | Team details |
| POST | `/api/teams/join/:inviteCode` | Join via code |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/progress` | Log progress |
| GET | `/api/progress/:challengeId` | My logs |
| GET | `/api/progress/:challengeId/calendar` | Calendar view |

## Real-Time (Socket.IO)

Connect with JWT token:
```js
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

// Subscribe to challenge updates
socket.emit('challenge:subscribe', 'challenge-id');

// Listen for progress updates
socket.on('challenge:progress', (data) => {
  console.log('Progress update:', data);
});
```

## Demo Credentials

After running `npm run db:seed`:

| Email | Password |
|-------|----------|
| lena@example.com | password123 |
| sarah@example.com | password123 |
| ahmed@example.com | password123 |
