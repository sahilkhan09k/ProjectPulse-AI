const express = require('express');
const router = express.Router();
const { getRecoveryRecommendations } = require('../controllers/ai.controller');
const { verifyJwt } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

// Validation rules
const recoveryValidation = [
  body('reliabilityScore')
    .notEmpty().withMessage('reliabilityScore is required')
    .isFloat({ min: 0, max: 100 }).withMessage('reliabilityScore must be between 0 and 100'),
  body('blockerCount')
    .notEmpty().withMessage('blockerCount is required')
    .isInt({ min: 0 }).withMessage('blockerCount must be a non-negative integer'),
  body('stagnationCount')
    .notEmpty().withMessage('stagnationCount is required')
    .isInt({ min: 0 }).withMessage('stagnationCount must be a non-negative integer'),
  body('overloadMembers')
    .notEmpty().withMessage('overloadMembers is required')
    .isInt({ min: 0 }).withMessage('overloadMembers must be a non-negative integer'),
  body('daysRemaining')
    .notEmpty().withMessage('daysRemaining is required')
    .isInt().withMessage('daysRemaining must be an integer')
];

// All routes require authentication
router.use(verifyJwt);

// Routes
router.post('/recovery', recoveryValidation, validate, getRecoveryRecommendations);

module.exports = router;
