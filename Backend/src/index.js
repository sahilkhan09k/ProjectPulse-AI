const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./db/index");
const { app } = require("./app");
const { validateEnv } = require("./utils/validateEnv");
const { initializeSocket } = require("./config/socket");
const socketService = require("./services/socket.service");

// Load environment variables
dotenv.config({
    path: './.env'
});

// Validate environment variables
validateEnv();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Initialize socket service
socketService.initialize(io);

// Make io accessible to the app
app.set('io', io);

// Connect to database and start server
connectDB()
    .then(() => {
        const port = process.env.PORT || 5000;

        app.on("error", (err) => {
            console.error("Express app error:", err);
        });

        server.listen(port, () => {
            console.log(`✅ Server running on port ${port}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔌 Socket.io initialized`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    });