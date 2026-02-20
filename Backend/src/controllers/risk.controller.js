const RiskAlert = require('../models/riskAlert.model');
const riskService = require('../services/risk.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get all risk alerts (optionally filtered by projectId)
 * @route GET /api/risks?projectId=:projectId
 * @access Private
 */
const getAllRisks = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  
  if (!projectId) {
    throw new ApiError(400, 'Project ID is required');
  }
  
  const alerts = await riskService.getActiveAlerts(projectId);
  
  res.status(200).json(
    new ApiResponse(200, alerts, 'Risk alerts retrieved successfully')
  );
});

/**
 * Get risk alert by ID
 * @route GET /api/risks/:id
 * @access Private
 */
const getRiskById = asyncHandler(async (req, res) => {
  const alert = await RiskAlert.findById(req.params.id);
  
  if (!alert) {
    throw new ApiError(404, 'Risk alert not found');
  }
  
  res.status(200).json(
    new ApiResponse(200, alert, 'Risk alert retrieved successfully')
  );
});

/**
 * Resolve risk alert
 * @route PATCH /api/risks/:id/resolve
 * @access Private
 */
const resolveRisk = asyncHandler(async (req, res) => {
  const alert = await riskService.resolveAlert(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, alert, 'Risk alert resolved successfully')
  );
});

module.exports = {
  getAllRisks,
  getRiskById,
  resolveRisk
};
