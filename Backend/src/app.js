const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Allow cookies
}));

// Body parsing middleware
app.use(express.json({
    limit: "16kb",
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

// Static files
app.use(express.static("public"));

// Cookie parser (must be before routes)
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/risks', require('./routes/risk.routes'));
app.use('/api/simulation', require('./routes/simulation.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = { app };