const dotenv = require("dotenv");
const connectDB = require("./db/index");
const { app } = require("./app");
const { validateEnv } = require("./utils/validateEnv");

// Load environment variables
dotenv.config({
    path: './.env'
});

// Validate environment variables
validateEnv();

// Connect to database and start server
connectDB()
    .then(() => {
        const port = process.env.PORT || 5000;

        app.on("error", (err) => {
            console.error("Express app error:", err);
        });

        const server = app.listen(port, () => {
            console.log(`✅ Server running on port ${port}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
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