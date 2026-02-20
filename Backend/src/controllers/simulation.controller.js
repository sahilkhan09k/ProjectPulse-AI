const simulationService = require('../services/simulation.service');
const aiService = require('../services/ai.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Run failure simulation
 * @route POST /api/simulation/run
 * @access Private
 */
const runSimulation = asyncHandler(async (req, res) => {
  const { projectId, removeMembers, reduceDeadline, increaseBlockers } = req.body;
  
  if (!projectId) {
    throw new ApiError(400, 'Project ID is required');
  }
  
  // Validate parameters
  if (removeMembers !== undefined && (removeMembers < 0 || removeMembers > 50)) {
    throw new ApiError(400, 'removeMembers must be between 0 and 50');
  }
  
  if (reduceDeadline !== undefined && (reduceDeadline < 0 || reduceDeadline > 50)) {
    throw new ApiError(400, 'reduceDeadline must be between 0 and 50');
  }
  
  if (increaseBlockers !== undefined && (increaseBlockers < 0 || increaseBlockers > 15)) {
    throw new ApiError(400, 'increaseBlockers must be between 0 and 15');
  }
  
  // Run simulation
  const simulationResult = await simulationService.runSimulation(projectId, {
    removeMembers: removeMembers || 0,
    reduceDeadline: reduceDeadline || 0,
    increaseBlockers: increaseBlockers || 0
  });
  
  // Get AI recommendations based on simulated metrics
  const aiRecommendations = await aiService.getRecoveryRecommendations({
    reliabilityScore: simulationResult.simulatedScore,
    blockerCount: simulationResult.counts.blockerCount,
    stagnationCount: simulationResult.counts.stagnationCount,
    overloadMembers: simulationResult.counts.overloadMembers,
    daysRemaining: simulationResult.daysRemaining
  });
  
  // Combine results
  const response = {
    ...simulationResult,
    recommendations: aiRecommendations
  };
  
  res.status(200).json(
    new ApiResponse(200, response, 'Simulation completed successfully')
  );
});

module.exports = {
  runSimulation
};
