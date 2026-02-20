# Backend - MERN Stack Application

## Overview

This is the backend server for a MERN (MongoDB, Express, React, Node.js) stack application. The server provides RESTful API endpoints and handles authentication, file uploads, and database operations.

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication and authorization
- **Cloudinary** - Cloud-based image and video management
- **Multer** - Middleware for handling multipart/form-data (file uploads)
- **CORS** - Cross-Origin Resource Sharing support
- **dotenv** - Environment variable management

## Environment Variables

The application requires the following environment variables to be configured in a `.env` file:

### Server Configuration
- `PORT` - Server port number (default: 5000)

### Database Configuration
- `MONGODB_URI` - MongoDB connection string (e.g., mongodb+srv://username:password@cluster.mongodb.net)

### CORS Configuration
- `CORS_ORIGIN` - Allowed CORS origins (e.g., * for all origins or specific URL)

### Cloudinary Configuration (File Uploads)
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### JWT Authentication Configuration
- `ACCESS_TOKEN_SECRET` - Secret key for access tokens (minimum 64 characters recommended)
- `REFRESH_TOKEN_SECRET` - Secret key for refresh tokens (minimum 64 characters recommended)
- `ACCESS_TOKEN_EXPIRES_IN` - Access token expiration time (e.g., 45m, 1h)
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiration time (e.g., 7d, 30d)

### Optional API Keys
- `GROQ_API_KEY` - API key for GROQ AI service
- `RESEND_API_KEY` - API key for Resend email service

**Note:** See `.env.example` for a template with placeholder values.

## Setup Instructions

Follow these steps to set up the backend locally:

### 1. Clone the repository
```bash
git clone <repository-url>
cd Backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Copy the `.env.example` file to create your own `.env` file:
```bash
cp .env.example .env
```

### 4. Configure environment variables
Open the `.env` file and replace all placeholder values with your actual configuration:
- Set up a MongoDB database (MongoDB Atlas or local)
- Create a Cloudinary account and get your credentials
- Generate secure random strings for JWT secrets
- Configure other API keys as needed

### 5. Start the development server
```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 5000).

## Available Scripts

- `npm run dev` - Start the development server with auto-reload (using nodemon)
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix ESLint issues


## Project Structure

```
Backend/
├── src/
│   ├── controllers/      # Route handlers (placeholder for future implementation)
│   ├── db/              # Database connection configuration
│   │   └── index.js     # MongoDB connection setup
│   ├── middlewares/     # Express middleware functions
│   │   ├── auth.middleware.js      # JWT authentication middleware
│   │   ├── error.middleware.js     # Centralized error handling
│   │   └── multer.middleware.js    # File upload configuration
│   ├── models/          # Mongoose schemas (placeholder for future implementation)
│   ├── routes/          # API route definitions (placeholder for future implementation)
│   ├── utils/           # Utility functions and helpers
│   │   ├── apiError.js         # Custom error class for API errors
│   │   ├── apiResponse.js      # Standardized API response class
│   │   ├── asyncHandler.js     # Async error handling wrapper
│   │   ├── cloudinary.js       # Cloudinary upload utility
│   │   ├── deleteFromCloudinary.js  # Cloudinary deletion utility
│   │   ├── extractPublicId.js  # Extract Cloudinary public ID
│   │   └── validateEnv.js      # Environment variable validation
│   ├── app.js           # Express app configuration and middleware setup
│   ├── constants.js     # Application constants
│   └── index.js         # Application entry point
├── public/
│   └── temp/            # Temporary storage for file uploads before Cloudinary
├── .env                 # Environment variables (not tracked in git)
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── .gitignore          # Git ignore rules
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

### Folder Descriptions

- **controllers/** - Empty placeholder for future route handler implementations
- **db/** - Database connection logic using Mongoose
- **middlewares/** - Express middleware for authentication, error handling, and file uploads
- **models/** - Empty placeholder for future Mongoose schema definitions
- **routes/** - Empty placeholder for future API route definitions
- **utils/** - Reusable utility functions for error handling, API responses, file uploads, and validation
- **public/temp/** - Temporary directory for file uploads before they're uploaded to Cloudinary


## Architecture

This application follows the **MVC (Model-View-Controller)** architectural pattern:

- **Models** - Define data structure and business logic (to be implemented in `models/`)
- **Views** - Handled by the frontend React application
- **Controllers** - Handle HTTP requests and responses (to be implemented in `controllers/`)
- **Routes** - Define API endpoints and map them to controllers (to be implemented in `routes/`)

### Current Implementation Status

The backend is currently in a foundational state with core infrastructure in place:

✅ **Implemented:**
- Express server setup with middleware configuration
- MongoDB database connection
- Environment variable validation
- JWT authentication middleware structure
- File upload handling with Multer and Cloudinary
- Centralized error handling
- Utility functions for API responses and async operations

🚧 **Placeholder Folders (For Future Implementation):**
- `controllers/` - Route handlers will be added here as features are developed
- `models/` - Mongoose schemas will be defined here (e.g., User, Post, etc.)
- `routes/` - API route definitions will be added here

### Important Notes

1. **User Model Reference**: The `auth.middleware.js` file imports a `User` model from `models/user.model.js`, which doesn't exist yet. This is intentional and represents a placeholder for future implementation. The authentication middleware is ready to use once the User model is created.

2. **Extensibility**: The current structure is designed to be easily extended. When adding new features:
   - Create Mongoose schemas in `models/`
   - Implement route handlers in `controllers/`
   - Define API endpoints in `routes/`
   - Import and use routes in `app.js`

3. **Error Handling**: All async route handlers should be wrapped with the `asyncHandler` utility to ensure errors are properly caught and forwarded to the error handling middleware.


## API Documentation

API endpoints will be documented here as they are implemented. 

### Future Documentation

For comprehensive API documentation, we recommend using one of the following tools:

- **Swagger/OpenAPI** - Industry-standard API documentation with interactive testing
- **Postman Collections** - Shareable API collections with examples
- **API Blueprint** - Markdown-based API documentation

### Planned Endpoints

API routes will be organized by resource type (e.g., `/api/users`, `/api/posts`, etc.) and will follow RESTful conventions.

## Contributing

When adding new features or endpoints:

1. Create necessary models in `src/models/`
2. Implement controllers in `src/controllers/`
3. Define routes in `src/routes/`
4. Update this README with new API endpoints
5. Ensure all code passes ESLint checks (`npm run lint`)
6. Test thoroughly before committing

## License

ISC

