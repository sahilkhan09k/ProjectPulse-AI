const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskAssignment
} = require('../controllers/task.controller');
const { verifyJwt } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

// Validation rules
const createTaskValidation = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'blocked', 'done']).withMessage('Invalid status value'),
  body('assigneeId')
    .notEmpty().withMessage('Assignee ID is required')
    .isMongoId().withMessage('Invalid assignee ID'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 }).withMessage('Estimated hours must be between 0 and 1000'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority value')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'blocked', 'done']).withMessage('Invalid status value'),
  body('assigneeId')
    .optional()
    .isMongoId().withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 }).withMessage('Estimated hours must be between 0 and 1000'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0, max: 1000 }).withMessage('Actual hours must be between 0 and 1000'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority value')
];

const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['todo', 'inprogress', 'blocked', 'done']).withMessage('Invalid status value')
];

const updateAssignmentValidation = [
  body('assigneeId')
    .notEmpty().withMessage('Assignee ID is required')
    .isMongoId().withMessage('Invalid assignee ID')
];

// All routes require authentication
router.use(verifyJwt);

// Routes
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTaskValidation, validate, createTask);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateStatusValidation, validate, updateTaskStatus);
router.patch('/:id/assign', updateAssignmentValidation, validate, updateTaskAssignment);

module.exports = router;
