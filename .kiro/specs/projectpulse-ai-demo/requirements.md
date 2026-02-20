# Requirements Document

## Introduction

ProjectPulse AI is a reliability-first project intelligence platform that predicts and prevents project failures through real-time analytics, AI-powered recommendations, and failure simulation capabilities. The system calculates a Reliability Score (0-100) based on project health metrics, detects risks automatically, and provides actionable recovery recommendations. This demo showcases the platform's core capabilities for the LOOP Hackathon 2026.

## Glossary

- **Authentication_System**: The subsystem responsible for user identity verification and session management
- **Reliability_Engine**: The subsystem that calculates project health scores based on velocity, blockers, overload, and stagnation metrics
- **Risk_Detector**: The subsystem that identifies and creates risk alerts when reliability thresholds are breached
- **Simulation_Engine**: The subsystem that performs in-memory failure scenario modeling without modifying persistent data
- **AI_Recovery_Service**: The subsystem that generates recovery recommendations using external AI APIs
- **Real_Time_Service**: The subsystem that broadcasts score updates to connected clients via Socket.io
- **Dashboard_UI**: The user interface displaying reliability metrics, risks, and simulation controls
- **User**: A person with authenticated access to the platform
- **Project**: A collection of tasks with a deadline and calculated health metrics
- **Task**: A unit of work with status, assignment, and time tracking properties
- **Risk_Alert**: A notification generated when reliability score falls below acceptable thresholds
- **Reliability_Score**: A calculated metric (0-100) representing project health based on four weighted factors
- **Blocker_Frequency**: The percentage of tasks in blocked status
- **Stagnation_Rate**: The percentage of tasks not updated within 48 hours
- **Overload_Ratio**: The percentage of users assigned more than 5 active tasks
- **Velocity_Consistency**: The variance in task completion rates over time
- **Failure_Simulation**: A temporary scenario modeling potential project disruptions
- **Recovery_Recommendation**: AI-generated actionable guidance for improving project health

## Requirements

### Requirement 1: User Authentication

**User Story:** As a platform user, I want to authenticate with email and password, so that I can securely access my project data.

#### Acceptance Criteria

1. WHEN a User submits valid credentials, THE Authentication_System SHALL generate a JWT token
2. WHEN a User submits invalid credentials, THE Authentication_System SHALL return an authentication error
3. THE Authentication_System SHALL hash passwords before storage using bcrypt or equivalent
4. WHEN a JWT token is expired, THE Authentication_System SHALL reject the request with an unauthorized error
5. THE Authentication_System SHALL protect all project and task endpoints requiring valid JWT tokens
6. THE Authentication_System SHALL seed one demo user account on initial database setup

### Requirement 2: Data Model Persistence

**User Story:** As a developer, I want structured data models for users, projects, and tasks, so that the system can store and retrieve project information reliably.

#### Acceptance Criteria

1. THE Database_Schema SHALL define a User model with name, email, and passwordHash fields
2. THE Database_Schema SHALL define a Project model with name, deadline, healthScore, and reliabilityScore fields
3. THE Database_Schema SHALL define a Task model with title, status, assigneeId, dueDate, estimatedHours, actualHours, and updatedAt fields
4. WHEN a Task status field is set, THE Database_Schema SHALL validate it against allowed values (todo, inprogress, blocked, done)
5. THE Database_Schema SHALL enforce unique email constraints on User records
6. THE Database_Schema SHALL establish referential relationships between Task assigneeId and User records

### Requirement 3: Reliability Score Calculation

**User Story:** As a project manager, I want an automatically calculated reliability score, so that I can assess project health at a glance.

#### Acceptance Criteria

1. WHEN project metrics are available, THE Reliability_Engine SHALL calculate a score using the formula: 100 - (blockerPenalty×20) - (stagnationPenalty×15) - (velocityVariancePenalty×25) - (overloadPenalty×20)
2. THE Reliability_Engine SHALL calculate Blocker_Frequency as the percentage of tasks with status "blocked"
3. THE Reliability_Engine SHALL calculate Stagnation_Rate as the percentage of tasks with updatedAt timestamps older than 48 hours
4. THE Reliability_Engine SHALL calculate Overload_Ratio as the percentage of users assigned more than 5 tasks with status "todo" or "inprogress"
5. THE Reliability_Engine SHALL calculate Velocity_Consistency based on task completion rate variance over the project timeline
6. WHEN a Task status changes, THE Reliability_Engine SHALL recalculate the project Reliability_Score
7. WHEN a Task assignment changes, THE Reliability_Engine SHALL recalculate the project Reliability_Score
8. THE Reliability_Engine SHALL constrain the final Reliability_Score between 0 and 100

### Requirement 4: Automatic Risk Detection

**User Story:** As a project manager, I want automatic risk alerts when project health degrades, so that I can take corrective action proactively.

#### Acceptance Criteria

1. WHEN a Reliability_Score falls below 65, THE Risk_Detector SHALL create a Risk_Alert record
2. THE Risk_Detector SHALL populate Risk_Alert records with type, reason, confidence, and recommendedAction fields
3. WHEN a Reliability_Score rises above 65, THE Risk_Detector SHALL mark existing Risk_Alert records as resolved
4. THE Risk_Detector SHALL calculate confidence levels based on the severity of metric deviations
5. THE Risk_Detector SHALL generate specific reason text identifying which metrics triggered the alert

### Requirement 5: Failure Simulation Mode

**User Story:** As a project manager, I want to simulate failure scenarios, so that I can prepare contingency plans without affecting real project data.

#### Acceptance Criteria

1. WHEN a User activates simulation mode, THE Simulation_Engine SHALL accept three parameters: team member removal count, deadline reduction percentage, and blocked task increase count
2. THE Simulation_Engine SHALL perform all calculations in memory without modifying database records
3. WHEN simulation parameters are applied, THE Simulation_Engine SHALL recalculate the Reliability_Score using modified metrics
4. THE Simulation_Engine SHALL generate a forecast showing the simulated Reliability_Score
5. WHEN simulation completes, THE Simulation_Engine SHALL invoke the AI_Recovery_Service with simulated metrics
6. THE Simulation_Engine SHALL return both the simulated score and AI-generated recovery recommendations
7. WHEN a User exits simulation mode, THE Dashboard_UI SHALL display the original non-simulated Reliability_Score

### Requirement 6: AI Recovery Recommendations

**User Story:** As a project manager, I want AI-generated recovery recommendations, so that I can receive actionable guidance for improving project health.

#### Acceptance Criteria

1. WHEN the AI_Recovery_Service receives a request, THE AI_Recovery_Service SHALL accept reliabilityScore, blockerCount, stagnationCount, overloadMembers, and daysRemaining as input parameters
2. THE AI_Recovery_Service SHALL send a structured prompt to the GROQ API including all input metrics
3. WHEN the GROQ API responds, THE AI_Recovery_Service SHALL parse the response into a summary and actionItems array
4. IF the GROQ API request fails, THEN THE AI_Recovery_Service SHALL return a fallback recommendation with generic action items
5. THE AI_Recovery_Service SHALL complete requests within 10 seconds or return a timeout error
6. THE AI_Recovery_Service SHALL expose a POST endpoint at /api/ai/recovery

### Requirement 7: Dashboard Visualization

**User Story:** As a project manager, I want a visual dashboard displaying reliability metrics, so that I can monitor project health effectively.

#### Acceptance Criteria

1. THE Dashboard_UI SHALL display the current Reliability_Score as a large animated numeric value
2. WHEN the Reliability_Score is 75 or above, THE Dashboard_UI SHALL render the score indicator in green
3. WHEN the Reliability_Score is between 50 and 74, THE Dashboard_UI SHALL render the score indicator in yellow
4. WHEN the Reliability_Score is below 50, THE Dashboard_UI SHALL render the score indicator in red
5. THE Dashboard_UI SHALL display all active Risk_Alert records in a dedicated alerts section
6. THE Dashboard_UI SHALL display a workload summary grid showing task distribution across users
7. THE Dashboard_UI SHALL provide a "Simulate Failure" button that opens the simulation controls
8. THE Dashboard_UI SHALL follow modern, minimal design principles with Tailwind CSS styling

### Requirement 8: Real-Time Score Updates

**User Story:** As a project manager, I want live score updates without page refresh, so that I can see changes immediately when team members update tasks.

#### Acceptance Criteria

1. WHEN a Task status changes, THE Real_Time_Service SHALL emit a score update event via Socket.io
2. WHEN a Task assignment changes, THE Real_Time_Service SHALL emit a score update event via Socket.io
3. WHEN a Failure_Simulation completes, THE Real_Time_Service SHALL emit a simulation result event via Socket.io
4. WHEN the Dashboard_UI receives a score update event, THE Dashboard_UI SHALL update the displayed Reliability_Score without page reload
5. THE Real_Time_Service SHALL broadcast updates to all connected clients viewing the same project
6. THE Real_Time_Service SHALL establish Socket.io connections on the same port as the HTTP server

### Requirement 9: Demo Seed Data

**User Story:** As a hackathon judge, I want pre-populated demo data, so that I can immediately evaluate the platform's capabilities without manual setup.

#### Acceptance Criteria

1. THE Database_Seeder SHALL create exactly 1 Project record on initial setup
2. THE Database_Seeder SHALL create exactly 6 User records on initial setup
3. THE Database_Seeder SHALL create exactly 30 Task records on initial setup
4. THE Database_Seeder SHALL configure exactly 5 tasks with status "blocked"
5. THE Database_Seeder SHALL configure exactly 3 tasks with updatedAt timestamps older than 48 hours
6. THE Database_Seeder SHALL assign more than 5 active tasks to at least one User to trigger overload conditions
7. THE Database_Seeder SHALL configure initial data to produce a Reliability_Score between 65 and 70
8. THE Database_Seeder SHALL execute only when the database is empty to prevent duplicate data

### Requirement 10: API Error Handling

**User Story:** As a frontend developer, I want consistent error responses from all API endpoints, so that I can display meaningful error messages to users.

#### Acceptance Criteria

1. WHEN an API endpoint encounters an error, THE API_Handler SHALL return a JSON response with status, message, and errors fields
2. WHEN authentication fails, THE API_Handler SHALL return HTTP status code 401
3. WHEN a requested resource is not found, THE API_Handler SHALL return HTTP status code 404
4. WHEN validation fails, THE API_Handler SHALL return HTTP status code 400 with specific validation error details
5. WHEN an internal server error occurs, THE API_Handler SHALL return HTTP status code 500 and log the error details
6. THE API_Handler SHALL not expose sensitive system information in error messages

### Requirement 11: Simulation UI Controls

**User Story:** As a project manager, I want interactive sliders to configure failure scenarios, so that I can model different risk situations easily.

#### Acceptance Criteria

1. WHEN the simulation modal opens, THE Dashboard_UI SHALL display three slider controls for team member removal, deadline reduction, and blocked task increase
2. THE Dashboard_UI SHALL constrain the team member removal slider between 0 and the total team size minus 1
3. THE Dashboard_UI SHALL constrain the deadline reduction slider between 0 and 50 percent
4. THE Dashboard_UI SHALL constrain the blocked task increase slider between 0 and 15 tasks
5. WHEN a User adjusts any slider, THE Dashboard_UI SHALL display the current slider value
6. WHEN a User clicks "Run Simulation", THE Dashboard_UI SHALL send the slider values to the Simulation_Engine
7. WHEN simulation results are received, THE Dashboard_UI SHALL display the simulated score, forecast visualization, and AI recommendations in the modal

### Requirement 12: Project Deadline Tracking

**User Story:** As a project manager, I want to track days remaining until project deadline, so that I can assess time pressure in the reliability calculation.

#### Acceptance Criteria

1. THE Reliability_Engine SHALL calculate days remaining by subtracting the current date from the Project deadline
2. WHEN days remaining is less than 7, THE Reliability_Engine SHALL increase the velocity variance penalty by 10 percent
3. WHEN days remaining is negative, THE Dashboard_UI SHALL display the project as overdue
4. THE Dashboard_UI SHALL display days remaining as a numeric value on the project overview section
