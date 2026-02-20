const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

class AuthService {
  // Generate access token (short-lived)
  generateAccessToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  // Generate both tokens
  generateTokens(userId, email) {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId, email);
    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  // Register new user
  async registerUser(name, email, password) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.email);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  // Login user
  async loginUser(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate new tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.email);

    // Update refresh token in database (token rotation)
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Generate new tokens (token rotation)
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      user._id.toString(),
      user.email
    );

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  // Logout user
  async logoutUser(userId) {
    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();
