# End-to-End Testing Guide - ProjectPulse AI

This guide provides comprehensive end-to-end testing procedures for the ProjectPulse AI platform.

## Prerequisites

Before testing, ensure:
- Backend server is running on `http://localhost:5000`
- Frontend server is running on `http://localhost:5173`
- Database is seeded with demo data (`npm run seed` in Backend directory)
- MongoDB is running and accessible

## Test Scenarios

### 1. User Registration and Authentication Flow

#### Test Case 1.1: New User Registration
1. Navigate to `http://localhost:5173`
2. Click "Register" or navigate to `/register`
3. Fill in the registration form:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "Test123!"
4. Click "Register" button
5. **Expected Result**: 
   - User is created successfully
   - Redirected to dashboard
   - JWT tokens set in HTTP-only cookies
   - User info displayed in header

#### Test Case 1.2: User Login
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: "alice@projectpulse.demo"
   - Password: "Demo123!"
3. Click "Login" button
4. **Expected Result**:
   - Authentication successful
   - Redirected to dashboard
   - JWT tokens set in cookies
   - Dashboard loads with project data

#### Test Case 1.3: Invalid Login
1. Navigate to `/login`
2. Enter invalid credentials:
   - Email: "wrong@example.com"
   - Password: "wrongpassword"
3. Click "Login"
4. **Expected Result**:
   - Error message displayed
   - User remains on login page
   - No authentication tokens set

#### Test Case 1.4: Protected Route Access
1. Without logging in, try to access `http://localhost:5173/dashboard`
2. **Expected Result**:
   - Redirected to `/login`
   - Cannot access dashboard without authentication

#### Test Case 1.5: Logout
1. While logged in, click user menu in header
2. Click "Logout" button
3. **Expected Result**:
   - User logged out
   - Redirected to login page
   - JWT tokens cleared
   - Cannot access dashboard

### 2. Dashboard Display and Data Loading

#### Test Case 2.1: Reliability Score Display
1. Login and view dashboard
2. Observe the ReliabilityScoreCard
3. **Expected Result**:
   - Circular progress indicator displays
   - Score animates from 0 to actual value
   - Color coding correct:
     - Green if score ≥ 75
     - Yellow if score 50-74
     - Red if score < 50
   - Score value matches backend calculation

#### Test Case 2.2: Health Metrics Display
1. View the MetricsGrid on dashboard
2. **Expected Result**:
   - 4 metric cards displayed in 2x2 grid:
     - Blocker Frequency
     - Stagnation Rate
     - Overload Ratio
     - Velocity Variance
   - Each shows percentage value
   - Icons displayed correctly
   - Hover effects work

#### Test Case 2.3: Risk Alerts Panel
1. View the RiskAlertsPanel
2. **Expected Result**:
   - Active risk alerts displayed
   - Each alert shows:
     - Type (critical/warning)
     - Reason
     - Confidence level
     - Recommended action
   - Color-coded left border (red/yellow)
   - Expandable details work
   - Empty state shown if no alerts

#### Test Case 2.4: Workload Summary
1. View the WorkloadSummary component
2. **Expected Result**:
   - Horizontal bar chart displays
   - All team members listed
   - Task counts shown
   - Overloaded members (>5 tasks) highlighted in red
   - Tooltips show task breakdown on hover

#### Test Case 2.5: Task List
1. View the TaskList component
2. **Expected Result**:
   - All tasks displayed in table format
   - Columns: Title, Status, Assignee, Due Date, Priority
   - Status badges color-coded
   - Filter by status works
   - Sort by due date/priority works

#### Test Case 2.6: Header Information
1. View the Header component
2. **Expected Result**:
   - Project name displayed
   - Days remaining shown
   - Overdue indicator if past deadline
   - User menu accessible

### 3. Real-Time Updates

#### Test Case 3.1: Real-Time Score Updates
1. Open dashboard in Browser Window 1
2. Open another browser window (Window 2) and login
3. In Window 2, use API or database to update a task status
4. **Expected Result**:
   - Window 1 receives `score:updated` Socket.io event
   - Reliability score updates without page refresh
   - Metrics update automatically
   - Pulse animation plays on score card

#### Test Case 3.2: Real-Time Risk Alerts
1. Open dashboard in Browser Window 1
2. Trigger a score drop below 65 (via API or database)
3. **Expected Result**:
   - Window 1 receives `risk:created` event
   - New alert appears in RiskAlertsPanel
   - Slide-in animation plays
   - Toast notification shown

#### Test Case 3.3: Real-Time Alert Resolution
1. With active alerts displayed
2. Trigger score increase above 65
3. **Expected Result**:
   - `risk:resolved` event received
   - Alert removed from panel
   - Toast notification shown

#### Test Case 3.4: Socket.io Connection
1. Open browser developer console
2. Login to dashboard
3. **Expected Result**:
   - Socket.io connection established
   - Joined project room
   - No connection errors in console

#### Test Case 3.5: Socket.io Reconnection
1. While on dashboard, stop backend server
2. Wait 5 seconds
3. Restart backend server
4. **Expected Result**:
   - Socket automatically reconnects
   - Dashboard continues to function
   - Real-time updates resume

### 4. Failure Simulation

#### Test Case 4.1: Open Simulation Modal
1. On dashboard, click "Simulate Failure" button (bottom-right)
2. **Expected Result**:
   - SimulationModal opens
   - Backdrop blur applied
   - Modal displays with animation
   - Three sliders visible

#### Test Case 4.2: Adjust Simulation Parameters
1. In simulation modal, adjust sliders:
   - Remove Members: 2
   - Reduce Deadline: 30%
   - Increase Blockers: 5
2. **Expected Result**:
   - Slider values update in real-time
   - Current values displayed
   - Constraints enforced:
     - Remove Members: 0 to (teamSize - 1)
     - Reduce Deadline: 0 to 50%
     - Increase Blockers: 0 to 15

#### Test Case 4.3: Run Simulation
1. Set simulation parameters
2. Click "Run Simulation" button
3. **Expected Result**:
   - Loading spinner appears
   - API request sent to `/api/simulation/run`
   - Results section appears after ~2-5 seconds
   - No page refresh

#### Test Case 4.4: View Simulation Results
1. After simulation completes
2. **Expected Result**:
   - Before/after score comparison displayed
   - Recharts bar chart shows metrics breakdown
   - Simulated score differs from original
   - Color coding reflects new score
   - Fade-in animation plays

#### Test Case 4.5: View AI Recommendations
1. After simulation completes
2. Scroll to AI Recommendations section
3. **Expected Result**:
   - AI-generated summary displayed
   - Numbered list of action items
   - Icons for each action
   - Recommendations relevant to simulation

#### Test Case 4.6: AI Fallback
1. Stop GROQ API or remove API key
2. Run simulation
3. **Expected Result**:
   - Simulation still completes
   - Generic fallback recommendations shown
   - No error breaks the UI
   - 5 actionable items provided

#### Test Case 4.7: Close Simulation Modal
1. Click "Close" button or backdrop
2. **Expected Result**:
   - Modal closes with animation
   - Dashboard returns to normal view
   - Original score displayed
   - Can reopen modal

#### Test Case 4.8: Real-Time Simulation Broadcast
1. Open dashboard in two browser windows
2. Run simulation in Window 1
3. **Expected Result**:
   - Window 2 receives `simulation:completed` event
   - Toast notification shown in Window 2
   - Both windows can view results

### 5. Error Handling and Edge Cases

#### Test Case 5.1: Network Error Handling
1. Disconnect from internet
2. Try to login or load dashboard
3. **Expected Result**:
   - Error message displayed
   - User-friendly error text
   - No application crash
   - Retry option available

#### Test Case 5.2: Invalid Token Handling
1. Manually clear JWT cookies
2. Try to access dashboard
3. **Expected Result**:
   - Redirected to login
   - No console errors
   - Clean logout

#### Test Case 5.3: API Timeout
1. Simulate slow API response (>30s)
2. **Expected Result**:
   - Loading state shown
   - Timeout error after reasonable time
   - User can retry

#### Test Case 5.4: Empty State Handling
1. Create project with no tasks
2. View dashboard
3. **Expected Result**:
   - Empty states shown appropriately
   - No errors or crashes
   - Helpful messages displayed

#### Test Case 5.5: Invalid Simulation Parameters
1. Try to send invalid parameters to simulation API
2. **Expected Result**:
   - Validation error returned
   - Error message displayed
   - Simulation doesn't run

### 6. Responsive Design Testing

#### Test Case 6.1: Mobile View (< 640px)
1. Resize browser to 375px width (iPhone size)
2. Navigate through all pages
3. **Expected Result**:
   - Layout adapts to mobile
   - All components visible
   - No horizontal scroll
   - Touch-friendly buttons
   - Readable text

#### Test Case 6.2: Tablet View (640px - 1024px)
1. Resize browser to 768px width (iPad size)
2. Navigate through all pages
3. **Expected Result**:
   - Layout adapts to tablet
   - Grid adjusts appropriately
   - All features accessible

#### Test Case 6.3: Desktop View (> 1024px)
1. View on full desktop screen (1920px)
2. **Expected Result**:
   - Full 3-column layout
   - Optimal spacing
   - All components visible
   - No wasted space

### 7. Accessibility Testing

#### Test Case 7.1: Keyboard Navigation
1. Use only keyboard (Tab, Enter, Escape)
2. Navigate through dashboard
3. **Expected Result**:
   - All interactive elements reachable
   - Focus indicators visible (2px outline)
   - Tab order logical
   - Enter activates buttons
   - Escape closes modals

#### Test Case 7.2: Screen Reader Support
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate dashboard
3. **Expected Result**:
   - ARIA labels present
   - Semantic HTML used
   - Meaningful alt text
   - Form labels associated

#### Test Case 7.3: Color Contrast
1. Use browser dev tools to check contrast
2. **Expected Result**:
   - Text contrast ratio ≥ 4.5:1
   - Interactive elements distinguishable
   - Color not sole indicator

#### Test Case 7.4: Reduced Motion
1. Enable "prefers-reduced-motion" in OS
2. View dashboard
3. **Expected Result**:
   - Animations disabled or reduced
   - No motion sickness triggers
   - Functionality preserved

### 8. Performance Testing

#### Test Case 8.1: Initial Load Time
1. Clear cache and reload dashboard
2. Measure load time
3. **Expected Result**:
   - Page loads in < 3 seconds
   - No blocking resources
   - Progressive rendering

#### Test Case 8.2: API Response Times
1. Monitor network tab during usage
2. **Expected Result**:
   - API responses < 500ms
   - Database queries optimized
   - No N+1 queries

#### Test Case 8.3: Real-Time Performance
1. Keep dashboard open for 30 minutes
2. Monitor memory usage
3. **Expected Result**:
   - No memory leaks
   - Socket connection stable
   - No performance degradation

#### Test Case 8.4: Multiple Concurrent Users
1. Open 5+ browser windows
2. All perform actions simultaneously
3. **Expected Result**:
   - All receive real-time updates
   - No race conditions
   - Server handles load

## Test Data

### Demo Users
All passwords: `Demo123!`

- alice@projectpulse.demo (Project Manager)
- bob@projectpulse.demo (Developer)
- carol@projectpulse.demo (Designer)
- david@projectpulse.demo (QA Engineer)
- eve@projectpulse.demo (DevOps)
- frank@projectpulse.demo (Product Owner)

### Expected Reliability Score Range
After seeding: 65-70 (demonstrates both healthy and at-risk states)

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Protected routes enforced
- [ ] Logout works
- [ ] Dashboard loads correctly
- [ ] Reliability score displays
- [ ] Health metrics display
- [ ] Risk alerts display
- [ ] Workload summary displays
- [ ] Task list displays
- [ ] Real-time score updates work
- [ ] Real-time risk alerts work
- [ ] Socket.io connection stable
- [ ] Simulation modal opens
- [ ] Simulation parameters adjust
- [ ] Simulation runs successfully
- [ ] Simulation results display
- [ ] AI recommendations display
- [ ] AI fallback works
- [ ] Simulation modal closes
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Performance acceptable

## Known Issues

Document any issues found during testing here:

1. [Issue description]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Severity: Critical/High/Medium/Low

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Notes

- All tests should be performed with a clean database seed
- Use browser dev tools to monitor console for errors
- Check network tab for failed requests
- Monitor application logs for backend errors
- Take screenshots of any issues found
