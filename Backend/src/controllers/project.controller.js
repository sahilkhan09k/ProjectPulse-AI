const Project = require('../models/project.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get all projects
 * @route GET /api/projects
 * @access Private
 */
const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  
  res.status(200).json(
    new ApiResponse(200, projects, 'Projects retrieved successfully')
  );
});

/**
 * Get project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  
  res.status(200).json(
    new ApiResponse(200, project, 'Project retrieved successfully')
  );
});

/**
 * Create new project
 * @route POST /api/projects
 * @access Private
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description, deadline } = req.body;
  
  // Validate deadline is in the future
  if (new Date(deadline) <= new Date()) {
    throw new ApiError(400, 'Deadline must be in the future');
  }
  
  const project = await Project.create({
    name,
    description,
    deadline,
    reliabilityScore: 100, // Initial score
    healthMetrics: {
      blockerFrequency: 0,
      stagnationRate: 0,
      overloadRatio: 0,
      velocityVariance: 0
    }
  });
  
  res.status(201).json(
    new ApiResponse(201, project, 'Project created successfully')
  );
});

/**
 * Update project
 * @route PUT /api/projects/:id
 * @access Private
 */
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, deadline } = req.body;
  
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  
  // Validate deadline if provided
  if (deadline && new Date(deadline) <= new Date()) {
    throw new ApiError(400, 'Deadline must be in the future');
  }
  
  // Update fields
  if (name) project.name = name;
  if (description) project.description = description;
  if (deadline) project.deadline = deadline;
  
  await project.save();
  
  res.status(200).json(
    new ApiResponse(200, project, 'Project updated successfully')
  );
});

/**
 * Delete project
 * @route DELETE /api/projects/:id
 * @access Private
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  
  await project.deleteOne();
  
  res.status(200).json(
    new ApiResponse(200, null, 'Project deleted successfully')
  );
});

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
