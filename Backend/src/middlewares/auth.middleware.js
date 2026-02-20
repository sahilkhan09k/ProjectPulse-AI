const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

// Verify JWT access token from Authorization header
const verifyJwt = asyncHandler(async (req, _res, next) => {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, "Access token is required. Please login.");
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.substring(7);

    if (!token) {
      throw new ApiError(401, "Access token is required. Please login.");
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-passwordHash -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, "Invalid access token");
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, "Access token expired. Please refresh your session.");
    }
    throw error;
  }
});

module.exports = { verifyJwt };