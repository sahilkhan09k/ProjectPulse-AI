const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Cookie options for HTTP-only cookies
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
});

const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/'
});

// Register new user
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.registerUser(name, email, password);

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  res.status(201).json(
    new ApiResponse(201, { user }, 'User registered successfully')
  );
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  res.status(200).json(
    new ApiResponse(200, { user }, 'Login successful')
  );
});

// Refresh access token
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

  // Set new tokens in HTTP-only cookies (token rotation)
  res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
  res.cookie('refreshToken', newRefreshToken, getCookieOptions());

  res.status(200).json(
    new ApiResponse(200, null, 'Access token refreshed successfully')
  );
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

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
