# ProjectPulse AI - Frontend

A modern, real-time dashboard for project reliability monitoring and failure simulation.

## Features

- **Real-Time Dashboard**: Live updates via Socket.io for scores, alerts, and simulations
- **Reliability Monitoring**: Animated circular progress with color-coded health indicators
- **Health Metrics**: Visual display of blocker frequency, stagnation rate, overload ratio, and velocity variance
- **Risk Alerts**: Expandable alert cards with confidence levels and recommended actions
- **Team Workload**: Horizontal bar charts showing task distribution and overload indicators
- **Task Management**: Filterable and sortable task list with status badges
- **Failure Simulation**: Interactive modal with parameter sliders and AI recommendations
- **Authentication**: Secure JWT-based auth with HTTP-only cookies

## Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM
- **State Management**: React Hooks + Context API
- **Real-Time**: Socket.io Client
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Heroicons
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:5000

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
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the App

Development mode (with hot reload):
```bash
npm run dev
```

The app will start on `http://localhost:5173`

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Testing

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting

Run linter:
```bash
npm run lint
```

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── common/            # Reusable UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── simulation/        # Simulation modal components
│   ├── contexts/              # React contexts (Auth, Socket)
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   ├── services/              # API service layer
│   ├── utils/                 # Utility functions
│   ├── test/                  # Test setup
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── vite.config.js             # Vite configuration
├── vitest.config.js           # Vitest configuration
└── package.json               # Dependencies and scripts
```

## Key Components

### Dashboard Components

- **ReliabilityScoreCard**: Animated circular progress indicator with color coding
- **MetricsGrid**: 2x2 grid displaying health metrics with icons
- **RiskAlertsPanel**: List of expandable risk alert cards with real-time updates
- **WorkloadSummary**: Horizontal bar chart showing team workload distribution
- **TaskList**: Filterable and sortable table of project tasks
- **Header**: Navigation bar with project info and user menu

### Simulation Components

- **SimulationModal**: Full-screen modal for failure simulation
- **SimulationControls**: Three range sliders for simulation parameters
- **SimulationResults**: Before/after comparison with Recharts visualization
- **AIRecommendations**: AI-generated recovery suggestions

### Common Components

- **Button**: Reusable button with variants (primary, secondary, ghost, danger)
- **Input**: Form input with validation states and helper text
- **Modal**: Generic modal component with backdrop and animations
- **Spinner**: Loading spinner in multiple sizes
- **Toast**: Toast notification system with auto-dismiss
- **ProtectedRoute**: Route wrapper for authenticated pages

## Authentication Flow

1. User visits `/login` or `/register`
2. Credentials sent to backend API
3. Backend returns JWT tokens in HTTP-only cookies
4. Frontend stores user data in AuthContext
5. Protected routes check authentication status
6. Axios interceptor handles token refresh on 401 errors

## Real-Time Updates

The app uses Socket.io for real-time updates:

- **score:updated**: Reliability score changes
- **simulation:completed**: Simulation results ready
- **risk:created**: New risk alert generated
- **risk:resolved**: Risk alert resolved
- **task:updated**: Task status changed

## API Integration

All API calls go through the centralized `api.js` service:

- **authAPI**: Authentication endpoints
- **projectsAPI**: Project CRUD operations
- **tasksAPI**: Task management
- **risksAPI**: Risk alert operations
- **simulationAPI**: Failure simulation
- **aiAPI**: AI recommendations

## Styling

The app uses Tailwind CSS v4 with custom configuration:

- Responsive design (mobile-first)
- Color-coded health indicators (green, yellow, red)
- Smooth animations with Framer Motion
- Consistent spacing and typography
- Dark mode support (future enhancement)

## Performance Optimizations

- Code splitting with React.lazy (future enhancement)
- Memoization with useMemo and useCallback
- Debounced search and filters (future enhancement)
- Optimized re-renders with React.memo (future enhancement)
- Efficient Socket.io event handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Demo Credentials

```
Email: alice@projectpulse.demo
Password: Demo123!
```

Other demo users:
- bob@projectpulse.demo
- carol@projectpulse.demo
- david@projectpulse.demo
- eve@projectpulse.demo
- frank@projectpulse.demo

All passwords: `Demo123!`

## Troubleshooting

### Connection Issues

If Socket.io connection fails:
1. Check backend is running on http://localhost:5000
2. Verify CORS settings in backend
3. Check browser console for errors
4. Ensure JWT token is valid

### Build Issues

If build fails:
1. Clear node_modules: `rm -rf node_modules`
2. Clear cache: `npm cache clean --force`
3. Reinstall: `npm install`
4. Try again: `npm run build`

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Test on multiple browsers
5. Ensure accessibility compliance

## License

ISC
