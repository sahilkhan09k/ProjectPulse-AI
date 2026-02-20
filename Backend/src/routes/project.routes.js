const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/project.controller');
const { verifyJwt } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

// Validation rules
const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3, max: 200 }).withMessage('Project name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date')
];

const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Project name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date')
];

// All routes require authentication
router.use(verifyJwt);

// Routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProjectValidation, validate, createProject);
router.put('/:id', updateProjectValidation, validate, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
