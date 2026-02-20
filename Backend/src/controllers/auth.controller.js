const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// Register new user
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.registerUser(name, email, password);

  res.status(201).json(
    new ApiResponse(201, { user, accessToken, refreshToken }, 'User registered successfully')
  );
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  res.status(200).json(
    new ApiResponse(200, { user, accessToken, refreshToken }, 'Login successful')
  );
});

// Refresh access token
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

  res.status(200).json(
    new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Access token refreshed successfully')
  );
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  res.status(200).json(
    new ApiResponse(200, null, 'Logout successful')
  );
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { user }, 'User retrieved successfully')
  );
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
};
