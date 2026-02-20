# ProjectPulse AI - Backend

A reliability-first project intelligence platform that predicts and prevents project failures through real-time analytics, AI-powered recommendations, and failure simulation capabilities.

## Features

- **Reliability Score Calculation**: Real-time project health monitoring with weighted metrics
- **Risk Detection**: Automatic alert generation when reliability falls below threshold
- **Failure Simulation**: In-memory "what-if" scenario modeling
- **AI Recommendations**: GROQ-powered recovery suggestions with fallback support
- **Real-Time Updates**: Socket.io integration for live dashboard updates
- **JWT Authentication**: Secure access/refresh token system with HTTP-only cookies

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **Real-time**: Socket.io
- **AI**: GROQ API (Llama 3.1)
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key (optional)
```

### Database Seeding

Seed the database with demo data (6 users, 1 project, 30 tasks):

```bash
npm run seed
```

**Demo Credentials:**
- Email: `alice@projectpulse.demo` (or any user from seed data)
- Password: `Demo123!`

The seeder creates a project with a reliability score in the 65-70 range to demonstrate both healthy and at-risk states.

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks?projectId=:id` - Get tasks (filtered by project)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/assign` - Update task assignment

#### Risk Alerts
- `GET /api/risks?projectId=:id` - Get active alerts
- `GET /api/risks/:id` - Get alert by ID
- `PATCH /api/risks/:id/resolve` - Resolve alert

#### Simulation
- `POST /api/simulation/run` - Run failure simulation

#### AI
- `POST /api/ai/recovery` - Get AI recovery recommendations

### Socket.io Events

#### Client → Server
- `project:join` - Join project room
- `project:leave` - Leave project room

#### Server → Client
- `score:updated` - Reliability score updated
- `simulation:completed` - Simulation completed
- `risk:created` - Risk alert created
- `risk:resolved` - Risk alert resolved
- `task:updated` - Task updated

### Code Quality

Run linter:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files (socket, etc.)
│   ├── controllers/     # Request handlers
│   ├── db/              # Database connection and seeding
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── index.js         # Entry point
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
└── package.json         # Dependencies and scripts
```

## Reliability Score Calculation

The reliability score (0-100) is calculated using four weighted metrics:

- **Blocker Frequency** (20%): Percentage of blocked tasks
- **Stagnation Rate** (15%): Percentage of tasks not updated in 48+ hours
- **Velocity Variance** (25%): Inconsistency in task completion rates
- **Overload Ratio** (20%): Percentage of team members with >5 active tasks

Formula:
```
score = 100 - (blockerFreq × 20) - (stagnation × 15) - (velocity × 25) - (overload × 20)
```

Risk alerts are automatically generated when the score falls below 65.

## License

ISC
