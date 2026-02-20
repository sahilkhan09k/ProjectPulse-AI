const Task = require('../models/task.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get all tasks (optionally filtered by projectId)
 * @route GET /api/tasks?projectId=:projectId
 * @access Private
 */
const getAllTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  
  const filter = projectId ? { projectId } : {};
  const tasks = await Task.find(filter)
    .populate('assigneeId', 'name email')
    .sort({ createdAt: -1 });
  
  res.status(200).json(
    new ApiResponse(200, tasks, 'Tasks retrieved successfully')
  );
});

/**
 * Get task by ID
 * @route GET /api/tasks/:id
 * @access Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assigneeId', 'name email');
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  res.status(200).json(
    new ApiResponse(200, task, 'Task retrieved successfully')
  );
});

/**
 * Create new task
 * @route POST /api/tasks
 * @access Private
 */
const createTask = asyncHandler(async (req, res) => {
  const {
    projectId,
    title,
    description,
    status,
    assigneeId,
    dueDate,
    estimatedHours,
    priority
  } = req.body;
  
  const task = await Task.create({
    projectId,
    title,
    description,
    status: status || 'todo',
    assigneeId,
    dueDate,
    estimatedHours,
    priority: priority || 'medium'
  });
  
  const populatedTask = await Task.findById(task._id)
    .populate('assigneeId', 'name email');
  
  res.status(201).json(
    new ApiResponse(201, populatedTask, 'Task created successfully')
  );
});

/**
 * Update task
 * @route PUT /api/tasks/:id
 * @access Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    status,
    assigneeId,
    dueDate,
    estimatedHours,
    actualHours,
    priority
  } = req.body;
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  // Update fields
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;
  if (assigneeId) task.assigneeId = assigneeId;
  if (dueDate) task.dueDate = dueDate;
  if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
  if (actualHours !== undefined) task.actualHours = actualHours;
  if (priority) task.priority = priority;
  
  await task.save();
  
  const populatedTask = await Task.findById(task._id)
    .populate('assigneeId', 'name email');
  
  res.status(200).json(
    new ApiResponse(200, populatedTask, 'Task updated successfully')
  );
});

/**
 * Delete task
 * @route DELETE /api/tasks/:id
 * @access Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  await task.deleteOne();
  
  res.status(200).json(
    new ApiResponse(200, null, 'Task deleted successfully')
  );
});

/**
 * Update task status
 * @route PATCH /api/tasks/:id/status
 * @access Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    throw new ApiError(400, 'Status is required');
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  task.status = status;
  await task.save();
  
  const populatedTask = await Task.findById(task._id)
    .populate('assigneeId', 'name email');
  
  res.status(200).json(
    new ApiResponse(200, populatedTask, 'Task status updated successfully')
  );
});

/**
 * Update task assignment
 * @route PATCH /api/tasks/:id/assign
 * @access Private
 */
const updateTaskAssignment = asyncHandler(async (req, res) => {
  const { assigneeId } = req.body;
  
  if (!assigneeId) {
    throw new ApiError(400, 'Assignee ID is required');
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  task.assigneeId = assigneeId;
  await task.save();
  
  const populatedTask = await Task.findById(task._id)
    .populate('assigneeId', 'name email');
  
  res.status(200).json(
    new ApiResponse(200, populatedTask, 'Task assignment updated successfully')
  );
});

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskAssignment
};
