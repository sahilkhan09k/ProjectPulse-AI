# Frontend - MERN Stack Application

## Overview

This is the frontend client for a MERN (MongoDB, Express, React, Node.js) stack application. Built with React 19 and Vite, it provides a modern, fast development experience with Hot Module Replacement (HMR).

## Technology Stack

- **React 19** - JavaScript library for building user interfaces
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Code quality and style checking

## Setup Instructions

Follow these steps to set up the frontend locally:

### 1. Navigate to Frontend directory
```bash
cd Frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure backend API URL (if needed)
If your backend is running on a different port or domain, you may need to configure the API endpoint in your application. The default backend URL is `http://localhost:5000`.

### 4. Start development server
```bash
npm run dev
```

The application will start on `http://localhost:5173` (Vite's default port).

## Available Scripts

- `npm run dev` - Start the development server with HMR
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
Frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles (Tailwind CSS)
├── public/              # Static assets
│   └── vite.svg         # Vite logo
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

### Folder Descriptions

- **src/** - Application source code (components, styles, utilities)
- **public/** - Static assets that are served directly
- **index.html** - Main HTML file that loads the React application

## Backend Connection

This frontend application connects to the backend API server. 

### Default Configuration
- **Backend URL**: `http://localhost:5000`
- **CORS**: The backend is configured to accept requests from the frontend origin

### Configuring API Endpoint

To change the backend API URL, update the API base URL in your application code where API calls are made. You may want to use environment variables for different environments:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Create a `.env` file in the Frontend directory:
```
VITE_API_URL=http://localhost:5000
```

### CORS Requirements

Ensure the backend's `CORS_ORIGIN` environment variable includes your frontend URL (e.g., `http://localhost:5173` for development).

## Development

### Hot Module Replacement (HMR)

Vite provides fast HMR out of the box. Changes to your React components will be reflected instantly without losing component state.

### React Plugins

This template uses [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) which uses Babel for Fast Refresh.

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be generated in the `dist/` directory, ready to be deployed to any static hosting service.

To preview the production build locally:

```bash
npm run preview
```

## Contributing

When adding new features:

1. Create components in the `src/` directory
2. Follow React best practices and hooks guidelines
3. Ensure code passes ESLint checks (`npm run lint`)
4. Test thoroughly in development mode before building
5. Keep components modular and reusable

## License

ISC

