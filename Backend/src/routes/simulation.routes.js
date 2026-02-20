const express = require('express');
const router = express.Router();
const { runSimulation } = require('../controllers/simulation.controller');
const { verifyJwt } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

// Validation rules
const runSimulationValidation = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('removeMembers')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('removeMembers must be between 0 and 50'),
  body('reduceDeadline')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('reduceDeadline must be between 0 and 50'),
  body('increaseBlockers')
    .optional()
    .isInt({ min: 0, max: 15 }).withMessage('increaseBlockers must be between 0 and 15')
];

// All routes require authentication
router.use(verifyJwt);

// Routes
router.post('/run', runSimulationValidation, validate, runSimulation);

module.exports = router;
