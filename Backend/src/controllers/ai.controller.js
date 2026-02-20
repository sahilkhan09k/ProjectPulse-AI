const aiService = require('../services/ai.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get AI recovery recommendations
 * @route POST /api/ai/recovery
 * @access Private
 */
const getRecoveryRecommendations = asyncHandler(async (req, res) => {
  const {
    reliabilityScore,
    blockerCount,
    stagnationCount,
    overloadMembers,
    daysRemaining
  } = req.body;
  
  // Validate required parameters
  if (reliabilityScore === undefined) {
    throw new ApiError(400, 'reliabilityScore is required');
  }
  
  if (blockerCount === undefined) {
    throw new ApiError(400, 'blockerCount is required');
  }
  
  if (stagnationCount === undefined) {
    throw new ApiError(400, 'stagnationCount is required');
  }
  
  if (overloadMembers === undefined) {
    throw new ApiError(400, 'overloadMembers is required');
  }
  
  if (daysRemaining === undefined) {
    throw new ApiError(400, 'daysRemaining is required');
  }
  
  // Get AI recommendations
  const recommendations = await aiService.getRecoveryRecommendations({
    reliabilityScore,
    blockerCount,
    stagnationCount,
    overloadMembers,
    daysRemaining
  });
  
  res.status(200).json(
    new ApiResponse(200, recommendations, 'Recommendations generated successfully')
  );
});

module.exports = {
  getRecoveryRecommendations
};
