# Implementation Plan: ProjectPulse AI Demo

## Overview

This implementation plan breaks down the ProjectPulse AI platform into 12 logical phases following a bottom-up approach: backend foundation, core business logic, API layer, AI integration, real-time features, frontend foundation, UI components, and final polish. Each task is designed to be independently implementable and testable, with property-based tests included as optional sub-tasks to validate correctness properties from the design document.

The implementation uses Node.js/Express for the backend, React/Vite for the frontend, MongoDB for persistence, Socket.io for real-time updates, and GROQ API for AI recommendations.

## Tasks

### Phase 1: Backend Foundation

- [x] 1. Set up backend project structure and dependencies
  - Create Backend directory with src folder structure (config, models, services, controllers, routes, middlewares, utils, db)
  - Initialize package.json with dependencies: express, mongoose, jsonwebtoken, bcrypt, socket.io, express-validator, winston, dotenv, cors
  - Add dev dependencies: jest, supertest, fast-check, nodemon
  - Create .env.example with all required environment variables
  - Set up basic Express app in src/app.js with middleware (cors, json parser, error handler)
  - Create src/index.js as entry point
  - _Requirements: 2.1, 2.2, 2.3, 10.1_

- [x] 2. Implement database models and schemas
  - [x] 2.1 Create User model with validation
    - Define User schema in src/models/user.model.js with name, email, passwordHash fields
    - Add email validation regex and unique index
    - Implement comparePassword method using bcrypt
    - Implement toJSON method to exclude passwordHash from responses
    - _Requirements: 2.1, 2.5_
  
  - [ ]* 2.2 Write property tests for User model
    - **Property 3: Passwords Are Never Stored in Plaintext**
    - **Property 6: Duplicate Emails Are Rejected**
    - **Validates: Requirements 1.3, 2.5**
  
  - [x] 2.3 Create Project model with health metrics
    - Define Project schema in src/models/project.model.js with name, deadline, reliabilityScore, healthMetrics fields
    - Add deadline validation (must be future date)
    - Add virtual fields for daysRemaining and isOverdue
    - _Requirements: 2.2, 12.1_
  
  - [x] 2.4 Create Task model with status validation
    - Define Task schema in src/models/task.model.js with all required fields
    - Add status enum validation (todo, inprogress, blocked, done)
    - Add indexes for projectId, assigneeId, and compound index for projectId+status
    - Add referential integrity for assigneeId
    - _Requirements: 2.3, 2.4, 2.6_
  
  - [ ]* 2.5 Write property tests for Task model
    - **Property 5: Invalid Task Status Values Are Rejected**
    - **Property 7: Invalid Assignee References Are Rejected**
    - **Validates: Requirements 2.4, 2.6**

  - [x] 2.6 Create RiskAlert model
    - Define RiskAlert schema in src/models/riskAlert.model.js with type, reason, confidence, recommendedAction, resolved fields
    - Add indexes for projectId and resolved status
    - Add compound index for projectId+resolved
    - _Requirements: 4.2_

- [x] 3. Implement authentication service and middleware
  - [x] 3.1 Create authentication service
    - Implement registerUser method in src/services/auth.service.js with bcrypt password hashing
    - Implement loginUser method with credential verification
    - Implement verifyToken method for JWT validation
    - Generate JWT tokens with 7-day expiration
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 3.2 Write property tests for authentication
    - **Property 1: Valid Credentials Generate Valid JWT**
    - **Property 2: Invalid Credentials Reject Authentication**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 3.3 Create authentication middleware
    - Implement JWT verification middleware in src/middlewares/auth.middleware.js
    - Extract userId from token and attach to request object
    - Handle expired tokens with 401 response
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 3.4 Write property tests for protected endpoints
    - **Property 4: Protected Endpoints Require Authentication**
    - **Validates: Requirements 1.5**

- [x] 4. Set up database connection and configuration
  - Create database connection module in src/config/database.js
  - Implement connection with retry logic and error handling
  - Add connection event listeners (connected, error, disconnected)
  - Create database initialization function
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Checkpoint - Verify backend foundation
  - Ensure all models are properly defined with validation
  - Verify database connection works
  - Test authentication service methods
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Core Reliability Engine and Risk Detection

- [x] 6. Implement reliability score calculation engine
  - [x] 6.1 Create metric calculation functions
    - Implement calculateBlockerFrequency in src/services/reliability.service.js
    - Implement calculateStagnationRate (48-hour threshold)
    - Implement calculateOverloadRatio (>5 active tasks threshold)
    - Implement calculateVelocityVariance with weekly grouping
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 6.2 Write property tests for metric calculations
    - **Property 9: Blocker Frequency Calculation**
    - **Property 10: Stagnation Rate Calculation**
    - **Property 11: Overload Ratio Calculation**
    - **Property 12: Velocity Consistency Calculation**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**
  
  - [x] 6.3 Implement reliability score formula
    - Create calculateReliabilityScore method with weighted formula
    - Apply deadline pressure modifier for projects with <7 days remaining
    - Constrain final score to 0-100 range
    - Update project record with calculated score and metrics
    - _Requirements: 3.1, 3.8, 12.2_
  
  - [ ]* 6.4 Write property tests for score calculation
    - **Property 8: Reliability Score Formula Correctness**
    - **Property 42: Deadline Pressure Increases Velocity Penalty**
    - **Validates: Requirements 3.1, 3.8, 12.2**
  
  - [x] 6.5 Implement automatic recalculation triggers
    - Add recalculateOnTaskChange method
    - Add recalculateOnAssignmentChange method
    - Integrate with Task model post-save and post-update hooks
    - _Requirements: 3.6, 3.7_
  
  - [ ]* 6.6 Write property tests for recalculation
    - **Property 13: Score Recalculation on Changes**
    - **Validates: Requirements 3.6, 3.7**

- [x] 7. Implement risk detection service
  - [x] 7.1 Create risk alert generation logic
    - Implement checkAndCreateAlerts method in src/services/risk.service.js
    - Generate alerts when score falls below 65
    - Calculate confidence levels based on severity (65 - score) / 65
    - Generate specific reason text identifying triggering metrics
    - Set alert type (critical if <50, warning if 50-64)
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [ ]* 7.2 Write property tests for risk detection
    - **Property 14: Risk Alerts Created Below Threshold**
    - **Property 16: Risk Confidence Correlates with Severity**
    - **Property 17: Risk Reasons Identify Triggering Metrics**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**

  - [x] 7.3 Implement alert resolution logic
    - Add logic to resolve existing alerts when score rises to 65 or above
    - Update resolved field and set resolvedAt timestamp
    - _Requirements: 4.3_
  
  - [ ]* 7.4 Write property tests for alert resolution
    - **Property 15: Risk Alerts Resolved Above Threshold**
    - **Validates: Requirements 4.3**
  
  - [x] 7.5 Integrate risk detection with reliability engine
    - Call checkAndCreateAlerts after each score recalculation
    - Pass calculated metrics to risk service
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Checkpoint - Verify core engine functionality
  - Test reliability score calculation with various metric combinations
  - Verify risk alerts are created and resolved correctly
  - Ensure automatic recalculation works on task changes
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: API Endpoints for Projects and Tasks

- [ ] 9. Implement authentication API endpoints
  - [ ] 9.1 Create auth routes and controllers
    - Implement POST /api/auth/register endpoint in src/controllers/auth.controller.js
    - Implement POST /api/auth/login endpoint
    - Implement GET /api/auth/me endpoint with auth middleware
    - Add input validation with express-validator
    - Set up routes in src/routes/auth.routes.js
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 9.2 Write integration tests for auth endpoints
    - Test successful registration and login
    - Test duplicate email rejection
    - Test invalid credentials rejection
    - Test protected endpoint access
    - **Validates: Requirements 1.1, 1.2, 1.5**

- [x] 10. Implement project API endpoints
  - [x] 10.1 Create project routes and controllers
    - Implement GET /api/projects endpoint in src/controllers/project.controller.js
    - Implement GET /api/projects/:id endpoint
    - Implement POST /api/projects endpoint with validation
    - Implement PUT /api/projects/:id endpoint
    - Implement DELETE /api/projects/:id endpoint
    - Add auth middleware to all routes
    - Set up routes in src/routes/project.routes.js
    - _Requirements: 2.2, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 10.2 Write integration tests for project endpoints
    - Test CRUD operations
    - Test authentication requirements
    - Test validation errors
    - Test 404 for non-existent projects
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [x] 11. Implement task API endpoints
  - [x] 11.1 Create task routes and controllers
    - Implement GET /api/tasks?projectId=:id endpoint in src/controllers/task.controller.js
    - Implement GET /api/tasks/:id endpoint
    - Implement POST /api/tasks endpoint with validation
    - Implement PUT /api/tasks/:id endpoint
    - Implement DELETE /api/tasks/:id endpoint
    - Implement PATCH /api/tasks/:id/status endpoint for status updates
    - Implement PATCH /api/tasks/:id/assign endpoint for assignment changes
    - Add auth middleware to all routes
    - Set up routes in src/routes/task.routes.js
    - _Requirements: 2.3, 2.4, 3.6, 3.7_
  
  - [ ]* 11.2 Write integration tests for task endpoints
    - Test CRUD operations
    - Test status update triggers score recalculation
    - Test assignment change triggers score recalculation
    - Test validation errors for invalid status values
    - **Validates: Requirements 2.4, 3.6, 3.7**

- [x] 12. Implement risk alert API endpoints
  - [x] 12.1 Create risk routes and controllers
    - Implement GET /api/risks?projectId=:id endpoint in src/controllers/risk.controller.js
    - Implement GET /api/risks/:id endpoint
    - Implement PATCH /api/risks/:id/resolve endpoint
    - Add auth middleware to all routes
    - Set up routes in src/routes/risk.routes.js
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 12.2 Write integration tests for risk endpoints
    - Test fetching active alerts
    - Test manual alert resolution
    - Test 404 for non-existent alerts
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 13. Implement error handling middleware
  - Create centralized error handler in src/middlewares/error.middleware.js
  - Return consistent JSON structure with status, message, errors fields
  - Map error types to HTTP status codes (401, 404, 400, 500)
  - Log errors with Winston without exposing sensitive information
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 13.1 Write property tests for error handling
  - **Property 32: Error Responses Have Consistent Structure**
  - **Property 33: Authentication Errors Return 401**
  - **Property 34: Not Found Errors Return 404**
  - **Property 35: Validation Errors Return 400 with Details**
  - **Property 36: Server Errors Return 500 and Log**
  - **Property 37: Error Messages Do Not Expose Sensitive Information**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

- [ ] 14. Checkpoint - Verify API layer
  - Test all CRUD endpoints with Postman or similar tool
  - Verify authentication protection works
  - Verify error responses are consistent
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Simulation Engine

- [x] 15. Implement failure simulation service
  - [x] 15.1 Create simulation engine core logic
    - Implement runSimulation method in src/services/simulation.service.js
    - Clone project, tasks, and users data for in-memory manipulation
    - Apply removeMembers parameter (reduce user count)
    - Apply reduceDeadline parameter (adjust deadline date)
    - Apply increaseBlockers parameter (change task statuses to blocked)
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 15.2 Write property tests for simulation immutability
    - **Property 18: Simulation Does Not Modify Database**
    - **Validates: Requirements 5.2**
  
  - [x] 15.3 Implement simulated score calculation
    - Reuse reliability calculation logic with simulated data
    - Calculate simulated metrics (blocker frequency, stagnation, overload, velocity)
    - Return both originalScore and simulatedScore
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 15.4 Write property tests for simulation calculations
    - **Property 19: Simulation Recalculates Score with Modified Metrics**
    - **Property 20: Simulation Returns Complete Results**
    - **Validates: Requirements 5.3, 5.4, 5.6**

- [x] 16. Create simulation API endpoint
  - [x] 16.1 Implement simulation controller and routes
    - Create POST /api/simulation/run endpoint in src/controllers/simulation.controller.js
    - Validate input parameters (removeMembers, reduceDeadline, increaseBlockers)
    - Call simulation service and AI service
    - Return complete simulation results with forecast and recommendations
    - Add auth middleware
    - Set up routes in src/routes/simulation.routes.js
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 16.2 Write integration tests for simulation endpoint
    - Test simulation with various parameter combinations
    - Verify database remains unchanged after simulation
    - Test parameter validation
    - **Validates: Requirements 5.1, 5.2, 5.7**

- [ ] 17. Checkpoint - Verify simulation functionality
  - Test simulation with different scenarios
  - Verify database is not modified
  - Verify simulated scores differ from original appropriately
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: AI Integration with GROQ

- [x] 18. Implement AI recovery service
  - [x] 18.1 Create GROQ API integration
    - Implement getRecoveryRecommendations method in src/services/ai.service.js
    - Build structured prompt with all input metrics (reliabilityScore, blockerCount, stagnationCount, overloadMembers, daysRemaining)
    - Send request to GROQ API with llama-3.1-70b-versatile model
    - Set 10-second timeout using AbortSignal
    - Parse JSON response into summary and actionItems
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 18.2 Write property tests for AI service
    - **Property 21: AI Service Accepts Required Parameters**
    - **Property 22: AI Service Includes Metrics in Prompt**
    - **Property 23: AI Service Parses Response Structure**
    - **Validates: Requirements 6.1, 6.2, 6.3**
  
  - [x] 18.3 Implement fallback recommendations
    - Add try-catch error handling for API failures
    - Return generic fallback recommendations with 5 actionable items
    - Log API errors without blocking the response
    - _Requirements: 6.4_
  
  - [ ]* 18.4 Write property tests for fallback behavior
    - **Property 24: AI Service Provides Fallback on Failure**
    - **Validates: Requirements 6.4**

- [x] 19. Create AI recovery API endpoint
  - [x] 19.1 Implement AI controller and routes
    - Create POST /api/ai/recovery endpoint in src/controllers/ai.controller.js
    - Validate input parameters
    - Call AI service and return recommendations
    - Handle timeout errors (408) and service unavailable errors (503)
    - Add auth middleware
    - Set up routes in src/routes/ai.routes.js
    - _Requirements: 6.6_
  
  - [ ]* 19.2 Write integration tests for AI endpoint
    - Test successful recommendation generation
    - Test fallback on API failure
    - Test timeout handling
    - **Validates: Requirements 6.4, 6.5, 6.6**

- [x] 20. Integrate AI service with simulation engine
  - Update simulation service to call AI service after calculating simulated score
  - Pass simulated metrics to AI service
  - Include AI recommendations in simulation results
  - _Requirements: 5.5, 5.6_

- [ ] 21. Checkpoint - Verify AI integration
  - Test AI service with real GROQ API key
  - Verify fallback works when API is unavailable
  - Test timeout handling
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Socket.io Real-Time Updates

- [ ] 22. Set up Socket.io server and authentication
  - [ ] 22.1 Configure Socket.io server
    - Create Socket.io configuration in src/config/socket.js
    - Initialize Socket.io with Express server
    - Configure CORS for frontend origin
    - Set up connection event handlers
    - _Requirements: 8.6_
  
  - [ ] 22.2 Implement Socket.io JWT authentication
    - Add authentication middleware for socket connections
    - Verify JWT token from handshake.auth.token
    - Attach userId to socket object
    - Close connection on authentication failure
    - _Requirements: 1.5, 8.6_

- [ ] 23. Implement real-time service and event broadcasting
  - [ ] 23.1 Create real-time service
    - Implement SocketService class in src/services/socket.service.js
    - Add project:join and project:leave event handlers for room management
    - Implement broadcastScoreUpdate method
    - Implement broadcastSimulationResult method
    - Implement broadcastRiskAlert methods (created and resolved)
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [ ]* 23.2 Write property tests for real-time events
    - **Property 28: Real-Time Events Emitted on Changes**
    - **Property 30: Real-Time Broadcasts to All Clients**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.5**
  
  - [ ] 23.3 Integrate real-time broadcasts with services
    - Call broadcastScoreUpdate after reliability score recalculation
    - Call broadcastSimulationResult after simulation completion
    - Call broadcastRiskAlert when alerts are created or resolved
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 24. Checkpoint - Verify real-time functionality
  - Test Socket.io connection with authentication
  - Verify events are broadcast to correct rooms
  - Test with multiple connected clients
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: Frontend Foundation

- [ ] 25. Set up frontend project structure
  - Create Frontend directory with Vite + React
  - Initialize package.json with dependencies: react, react-dom, react-router-dom, axios, socket.io-client, framer-motion, recharts, @heroicons/react, tailwindcss
  - Add dev dependencies: vite, @vitejs/plugin-react, vitest, @testing-library/react, @fast-check/jest
  - Configure Tailwind CSS with custom theme colors
  - Create src folder structure (components, contexts, hooks, pages, utils, services)
  - Create .env.example with VITE_API_URL and VITE_SOCKET_URL
  - _Requirements: 7.8_

- [ ] 26. Implement authentication context and hooks
  - [ ] 26.1 Create AuthContext
    - Implement AuthProvider in src/contexts/AuthContext.jsx
    - Store user state and JWT token in context
    - Persist token to localStorage
    - Implement login, register, logout methods
    - Implement token refresh logic
    - _Requirements: 1.1, 1.2_
  
  - [ ] 26.2 Create useAuth hook
    - Export useAuth hook for consuming auth context
    - Provide user, token, isAuthenticated, login, register, logout
    - _Requirements: 1.1, 1.2_

- [ ] 27. Implement API service layer
  - Create axios instance in src/services/api.js with base URL and interceptors
  - Add request interceptor to attach JWT token to headers
  - Add response interceptor to handle 401 errors (logout)
  - Create API methods for auth, projects, tasks, risks, simulation, AI
  - _Requirements: 1.5, 10.1_

- [ ] 28. Implement Socket.io context and hooks
  - [ ] 28.1 Create SocketContext
    - Implement SocketProvider in src/contexts/SocketContext.jsx
    - Initialize socket connection with JWT authentication
    - Implement connection, disconnection, and reconnection logic
    - Store socket instance in context
    - _Requirements: 8.6_
  
  - [ ] 28.2 Create useSocket hook
    - Export useSocket hook for consuming socket context
    - Provide socket instance and connection status
    - Implement helper methods for joining/leaving project rooms
    - _Requirements: 8.5, 8.6_

- [ ] 29. Set up routing and page structure
  - [ ] 29.1 Create route configuration
    - Set up React Router in src/App.jsx
    - Create routes for /login, /register, /dashboard
    - Implement ProtectedRoute component for authenticated routes
    - Add redirect logic (authenticated users to dashboard, unauthenticated to login)
    - _Requirements: 1.1, 1.2_
  
  - [ ] 29.2 Create basic page components
    - Create LoginPage in src/pages/LoginPage.jsx (placeholder)
    - Create RegisterPage in src/pages/RegisterPage.jsx (placeholder)
    - Create DashboardPage in src/pages/DashboardPage.jsx (placeholder)
    - _Requirements: 1.1, 1.2, 7.1_

- [ ] 30. Checkpoint - Verify frontend foundation
  - Test authentication flow (login, register, logout)
  - Verify routing and protected routes work
  - Test API service with backend
  - Ensure Socket.io connection establishes
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Dashboard UI Components

- [ ] 31. Implement authentication forms
  - [ ] 31.1 Create LoginForm component
    - Build form in src/components/auth/LoginForm.jsx with email and password inputs
    - Add form validation and error display
    - Call login method from useAuth hook
    - Show loading state during authentication
    - Redirect to dashboard on success
    - _Requirements: 1.1, 1.2_
  
  - [ ] 31.2 Create RegisterForm component
    - Build form in src/components/auth/RegisterForm.jsx with name, email, password inputs
    - Add form validation and error display
    - Call register method from useAuth hook
    - Show loading state during registration
    - Redirect to dashboard on success
    - _Requirements: 1.1, 1.2_

- [ ] 32. Implement ReliabilityScoreCard component
  - [ ] 32.1 Create score display with circular progress
    - Build ReliabilityScoreCard in src/components/dashboard/ReliabilityScoreCard.jsx
    - Implement circular SVG progress indicator (200px diameter)
    - Add animated score counter using Framer Motion
    - Implement color coding (green ≥75, yellow 50-74, red <50)
    - Add pulsing animation for critical scores (<50)
    - Display originalScore when in simulation mode
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 32.2 Write property tests for score display
    - **Property 25: Dashboard Color Codes Score Correctly**
    - **Validates: Requirements 7.2, 7.3, 7.4**

- [ ] 33. Implement MetricsGrid component
  - [ ] 33.1 Create MetricCard component
    - Build MetricCard in src/components/dashboard/MetricCard.jsx
    - Display metric name, percentage value, and icon
    - Add hover effects (scale and shadow)
    - Use Heroicons for metric icons
    - _Requirements: 7.1_
  
  - [ ] 33.2 Create MetricsGrid component
    - Build MetricsGrid in src/components/dashboard/MetricsGrid.jsx
    - Display 2x2 grid of MetricCard components
    - Pass blocker frequency, stagnation rate, overload ratio, velocity variance
    - _Requirements: 7.1_

- [ ] 34. Implement RiskAlertsPanel component
  - [ ] 34.1 Create RiskAlertCard component
    - Build RiskAlertCard in src/components/dashboard/RiskAlertCard.jsx
    - Display alert type, reason, confidence badge, and recommended action
    - Add left border color (red for critical, yellow for warning)
    - Implement expandable details section
    - Add dismiss button that calls resolve API
    - _Requirements: 7.5_
  
  - [ ] 34.2 Create RiskAlertsPanel component
    - Build RiskAlertsPanel in src/components/dashboard/RiskAlertsPanel.jsx
    - Fetch and display all active risk alerts
    - Stack RiskAlertCard components
    - Show empty state when no alerts
    - _Requirements: 7.5_
  
  - [ ]* 34.3 Write property tests for alerts display
    - **Property 26: Dashboard Displays All Active Alerts**
    - **Validates: Requirements 7.5**

- [ ] 35. Implement WorkloadSummary component
  - [ ] 35.1 Create workload bar chart
    - Build WorkloadSummary in src/components/dashboard/WorkloadSummary.jsx
    - Fetch users and their task counts
    - Display horizontal bar chart with user names and task counts
    - Color code bars (indigo for normal, red for overloaded >5 tasks)
    - Add tooltip showing task breakdown by status
    - _Requirements: 7.6_
  
  - [ ]* 35.2 Write property tests for workload display
    - **Property 27: Dashboard Displays Workload Distribution**
    - **Validates: Requirements 7.6**

- [ ] 36. Implement TaskList component
  - Create TaskList in src/components/dashboard/TaskList.jsx
  - Fetch and display tasks in a table format
  - Add columns for title, status, assignee, due date, priority
  - Implement filtering by status
  - Implement sorting by due date and priority
  - Add status badge with color coding
  - _Requirements: 2.3, 2.4_

- [ ] 37. Implement Header component
  - Create Header in src/components/dashboard/Header.jsx
  - Display project name and days remaining
  - Show overdue indicator when deadline is past
  - Add user menu with logout button
  - _Requirements: 12.3, 12.4_

- [ ]* 37.1 Write property tests for deadline display
  - **Property 41: Days Remaining Calculated Correctly**
  - **Property 43: Overdue Projects Display Correctly**
  - **Property 44: Days Remaining Displayed on Dashboard**
  - **Validates: Requirements 12.1, 12.3, 12.4**

- [ ] 38. Assemble DashboardPage with all components
  - Update DashboardPage in src/pages/DashboardPage.jsx
  - Add Header, ReliabilityScoreCard, MetricsGrid, RiskAlertsPanel, WorkloadSummary, TaskList
  - Implement responsive grid layout
  - Fetch project data on mount
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 39. Checkpoint - Verify dashboard UI
  - Test all dashboard components render correctly
  - Verify data fetching and display
  - Test responsive layout on different screen sizes
  - Ensure all tests pass, ask the user if questions arise.

### Phase 9: Simulation Modal

- [ ] 40. Implement SimulationControls component
  - [ ] 40.1 Create slider controls
    - Build SimulationControls in src/components/simulation/SimulationControls.jsx
    - Add three range sliders (removeMembers, reduceDeadline, increaseBlockers)
    - Display current slider values
    - Constrain removeMembers to 0 to teamSize-1
    - Constrain reduceDeadline to 0 to 50 percent
    - Constrain increaseBlockers to 0 to 15 tasks
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 40.2 Write property tests for slider constraints
    - **Property 38: Team Removal Slider Bounded by Team Size**
    - **Validates: Requirements 11.2**

- [ ] 41. Implement SimulationResults component
  - [ ] 41.1 Create results display
    - Build SimulationResults in src/components/simulation/SimulationResults.jsx
    - Display before/after score comparison
    - Create forecast visualization using Recharts (bar chart)
    - Show simulated metrics breakdown
    - Add fade-in animation when results load
    - _Requirements: 11.7_
  
  - [ ]* 41.2 Write property tests for results display
    - **Property 40: Simulation Results Display All Components**
    - **Validates: Requirements 11.7**

- [ ] 42. Implement AIRecommendations component
  - Create AIRecommendations in src/components/simulation/AIRecommendations.jsx
  - Display AI-generated summary text
  - Display actionable items as a numbered list
  - Add icons for each action item
  - Style with card layout and proper spacing
  - _Requirements: 6.3, 11.7_

- [ ] 43. Implement SimulationModal component
  - [ ] 43.1 Create modal structure
    - Build SimulationModal in src/components/simulation/SimulationModal.jsx
    - Add modal overlay with backdrop blur
    - Implement open/close state management
    - Add SimulationControls, SimulationResults, AIRecommendations components
    - Add "Run Simulation" button with loading state
    - Add "Close" button to exit simulation mode
    - _Requirements: 11.1, 11.6, 11.7_
  
  - [ ] 43.2 Implement simulation execution
    - Call simulation API when "Run Simulation" is clicked
    - Pass slider values to API
    - Display loading spinner during execution
    - Show results section when data is received
    - Handle errors and display error messages
    - _Requirements: 11.6, 11.7_
  
  - [ ]* 43.3 Write property tests for simulation flow
    - **Property 39: Slider Values Sent to Simulation Engine**
    - **Validates: Requirements 11.6**

- [ ] 44. Add simulation button to dashboard
  - Add fixed "Simulate Failure" button to bottom-right of DashboardPage
  - Open SimulationModal when clicked
  - Style with primary color and shadow
  - _Requirements: 7.7_

- [ ] 45. Checkpoint - Verify simulation UI
  - Test simulation modal opens and closes
  - Test slider controls and constraints
  - Test simulation execution and results display
  - Verify AI recommendations are shown
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10: Real-Time Integration

- [ ] 46. Implement real-time score updates in dashboard
  - [ ] 46.1 Add Socket.io event listeners
    - Subscribe to 'score:updated' event in DashboardPage
    - Update reliability score state when event is received
    - Update metrics state when event is received
    - Join project room on component mount
    - Leave project room on component unmount
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [ ]* 46.2 Write property tests for real-time updates
    - **Property 29: Dashboard Updates Without Reload**
    - **Validates: Requirements 8.4**

- [ ] 47. Implement real-time simulation results
  - Subscribe to 'simulation:completed' event in SimulationModal
  - Update simulation results state when event is received
  - Display results without closing modal
  - _Requirements: 8.3_

- [ ] 48. Implement real-time risk alert updates
  - Subscribe to 'risk:created' and 'risk:resolved' events in RiskAlertsPanel
  - Add new alerts to state when 'risk:created' is received
  - Remove resolved alerts from state when 'risk:resolved' is received
  - Add slide-in animation for new alerts
  - _Requirements: 8.1_

- [ ] 49. Add visual feedback for real-time updates
  - Add pulse animation to ReliabilityScoreCard when score changes
  - Add highlight effect to TaskList rows when tasks are updated
  - Add toast notifications for significant events (new alerts, simulation complete)
  - _Requirements: 8.4_

- [ ] 50. Checkpoint - Verify real-time integration
  - Test real-time updates with multiple browser windows
  - Verify score updates appear without refresh
  - Test simulation results broadcast
  - Test alert updates
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11: Seed Data

- [ ] 51. Implement database seeder
  - [ ] 51.1 Create seeder script
    - Create seed.js in src/db/seed.js
    - Implement idempotency check (only seed if database is empty)
    - Create 6 users with hashed passwords (all with password "Demo123!")
    - Create 1 project with deadline 21 days in future
    - Create 30 tasks with specific distribution
    - _Requirements: 9.1, 9.2, 9.3, 9.8_
  
  - [ ] 51.2 Configure task distribution for target score
    - Set 5 tasks to status "blocked" (16.7% blocker frequency)
    - Set 3 tasks with updatedAt 72 hours ago (10% stagnation rate)
    - Assign 8 active tasks to one user and 6 to another (33% overload ratio)
    - Distribute completed tasks across weeks to create velocity variance
    - _Requirements: 9.4, 9.5, 9.6, 9.7_
  
  - [ ] 51.3 Verify seed data produces target score
    - Calculate reliability score after seeding
    - Verify score is between 65 and 70
    - Log final score and metrics
    - Throw error if score is outside target range
    - _Requirements: 9.7_
  
  - [ ]* 51.4 Write unit tests for seeder
    - Test idempotency (no duplicate seeding)
    - Test exact counts (6 users, 1 project, 30 tasks)
    - Test specific configurations (5 blocked, 3 stale, overload conditions)
    - Test final score is in 65-70 range
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**
  
  - [ ]* 51.5 Write property tests for seeder
    - **Property 31: Seeder Executes Only on Empty Database**
    - **Validates: Requirements 9.8**

- [ ] 52. Add seed command to package.json
  - Add "seed" script to run seeder
  - Add instructions to README for running seeder
  - Test seeder execution
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 53. Checkpoint - Verify seed data
  - Run seeder and verify database is populated
  - Check user accounts can log in
  - Verify project and tasks are created correctly
  - Confirm reliability score is in target range (65-70)
  - Ensure all tests pass, ask the user if questions arise.

### Phase 12: Testing and Polish

- [ ] 54. Implement common UI components
  - Create Button component in src/components/common/Button.jsx with variants (primary, secondary, ghost)
  - Create Input component in src/components/common/Input.jsx with validation states
  - Create Modal component in src/components/common/Modal.jsx with backdrop and animations
  - Create Spinner component in src/components/common/Spinner.jsx for loading states
  - Create Toast component in src/components/common/Toast.jsx for notifications
  - _Requirements: 7.8_

- [ ] 55. Add accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works (Tab, Enter, Escape)
  - Add visible focus indicators (2px outline)
  - Test color contrast ratios (minimum 4.5:1 for text)
  - Add prefers-reduced-motion support for animations
  - _Requirements: 7.8_

- [ ] 56. Implement responsive design
  - Test and adjust layout for mobile (<640px)
  - Test and adjust layout for tablet (640px-1024px)
  - Test and adjust layout for desktop (>1024px)
  - Ensure all components are touch-friendly on mobile
  - _Requirements: 7.8_

- [ ] 57. Add logging and monitoring
  - Configure Winston logger with appropriate log levels
  - Add request/response logging middleware
  - Log all errors with stack traces
  - Add request ID to all logs for tracing
  - _Requirements: 10.5_

- [ ] 58. Create environment configuration files
  - Create .env.example for backend with all required variables
  - Create .env.example for frontend with API and Socket URLs
  - Add environment validation on startup
  - Document all environment variables in README
  - _Requirements: 6.1, 8.6_

- [ ] 59. Write comprehensive README documentation
  - Add project overview and features
  - Add installation instructions
  - Add environment setup guide
  - Add seeding instructions
  - Add API documentation
  - Add testing instructions
  - Add deployment guide
  - _Requirements: All_

- [ ] 60. Run full test suite and fix issues
  - Run all unit tests and ensure they pass
  - Run all property-based tests with 100 iterations
  - Run all integration tests
  - Fix any failing tests
  - Achieve target code coverage (backend 85%, frontend 80%)
  - _Requirements: All_

- [ ] 61. Perform end-to-end testing
  - Test complete user flow: register → login → view dashboard → run simulation → logout
  - Test real-time updates with multiple browser windows
  - Test error handling and edge cases
  - Test with different screen sizes and devices
  - _Requirements: All_

- [ ] 62. Optimize performance
  - Add database indexes for frequently queried fields
  - Implement request caching where appropriate
  - Optimize frontend bundle size (code splitting, lazy loading)
  - Minimize re-renders in React components
  - Test and optimize API response times
  - _Requirements: All_

- [ ] 63. Final polish and bug fixes
  - Review and fix any UI inconsistencies
  - Ensure all animations are smooth
  - Fix any console warnings or errors
  - Test all edge cases and error scenarios
  - Verify all requirements are met
  - _Requirements: All_

- [ ] 64. Final checkpoint - Production readiness
  - All tests passing (unit, property, integration)
  - All 12 requirements fully implemented
  - Documentation complete
  - Seed data working correctly
  - Real-time updates functioning
  - AI integration working with fallback
  - UI polished and responsive
  - Ready for demo and deployment
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breakpoints
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a logical order: backend foundation → business logic → API → AI → real-time → frontend → UI → polish
- All property tests reference their design document property number for easy cross-referencing
- The seed data is carefully calibrated to produce a reliability score in the 65-70 range to demonstrate both healthy and at-risk states
