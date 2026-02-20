const Task = require('../models/task.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');

/**
 * Reliability Score Calculation Service
 * Implements the core reliability engine with weighted metrics
 */

/**
 * Calculate blocker frequency metric
 * @param {Array} tasks - Array of task documents
 * @returns {number} - Percentage of blocked tasks (0-1)
 */
const calculateBlockerFrequency = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const blockedCount = tasks.filter(t => t.status === 'blocked').length;
  return blockedCount / tasks.length;
};

/**
 * Calculate stagnation rate metric
 * @param {Array} tasks - Array of task documents
 * @returns {number} - Percentage of stale tasks (0-1)
 */
const calculateStagnationRate = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const now = new Date();
  const staleThreshold = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  
  const staleCount = tasks.filter(t => {
    const timeSinceUpdate = now - new Date(t.updatedAt);
    return timeSinceUpdate > staleThreshold;
  }).length;
  
  return staleCount / tasks.length;
};

/**
 * Calculate overload ratio metric
 * @param {Array} tasks - Array of task documents
 * @param {Array} users - Array of user documents
 * @returns {number} - Percentage of overloaded users (0-1)
 */
const calculateOverloadRatio = (tasks, users) => {
  if (!users || users.length === 0) return 0;
  
  const activeTasks = tasks.filter(t => 
    t.status === 'todo' || t.status === 'inprogress'
  );
  
  // Count active tasks per user
  const tasksByUser = {};
  activeTasks.forEach(t => {
    if (t.assigneeId) {
      const userId = t.assigneeId.toString();
      tasksByUser[userId] = (tasksByUser[userId] || 0) + 1;
    }
  });
  
  // Count users with more than 5 active tasks
  const overloadedCount = Object.values(tasksByUser)
    .filter(count => count > 5).length;
  
  return overloadedCount / users.length;
};

/**
 * Calculate velocity variance metric
 * @param {Array} tasks - Array of task documents
 * @returns {number} - Normalized variance in completion rates (0-1)
 */
const calculateVelocityVariance = (tasks) => {
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  if (completedTasks.length < 2) return 0;
  
  // Group completed tasks by week
  const weeklyCompletions = {};
  completedTasks.forEach(t => {
    const completedDate = new Date(t.updatedAt);
    const weekKey = getWeekKey(completedDate);
    weeklyCompletions[weekKey] = (weeklyCompletions[weekKey] || 0) + 1;
  });
  
  const rates = Object.values(weeklyCompletions);
  if (rates.length < 2) return 0;
  
  // Calculate mean
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  
  // Calculate variance
  const variance = rates.reduce((sum, rate) => 
    sum + Math.pow(rate - mean, 2), 0
  ) / rates.length;
  
  // Normalize to 0-1 scale (higher variance = higher penalty)
  return Math.min(1, variance / (mean + 1));
};

/**
 * Helper function to get week key for grouping
 * @param {Date} date - Date to convert to week key
 * @returns {string} - Week key in format "YYYY-WW"
 */
const getWeekKey = (date) => {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const daysSinceStart = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceStart + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-${weekNumber.toString().padStart(2, '0')}`;
};

/**
 * Calculate days remaining until deadline
 * @param {Date} deadline - Project deadline
 * @returns {number} - Days remaining (can be negative if overdue)
 */
const calculateDaysRemaining = (deadline) => {
  const now = new Date();
  const diffMs = new Date(deadline) - now;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
};

/**
 * Calculate reliability score for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<number>} - Reliability score (0-100)
 */
const calculateReliabilityScore = async (projectId) => {
  // Fetch project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Fetch all tasks for project
  const tasks = await Task.find({ projectId });
  
  // Get unique assignee IDs
  const assigneeIds = [...new Set(
    tasks
      .filter(t => t.assigneeId)
      .map(t => t.assigneeId.toString())
  )];
  
  // Fetch users
  const users = await User.find({ _id: { $in: assigneeIds } });
  
  // Calculate individual metrics
  const blockerFrequency = calculateBlockerFrequency(tasks);
  const stagnationRate = calculateStagnationRate(tasks);
  const overloadRatio = calculateOverloadRatio(tasks, users);
  const velocityVariance = calculateVelocityVariance(tasks);
  
  // Apply deadline pressure modifier
  const daysRemaining = calculateDaysRemaining(project.deadline);
  const velocityPenalty = daysRemaining < 7 
    ? velocityVariance * 1.1 
    : velocityVariance;
  
  // Weighted formula
  const score = 100 
    - (blockerFrequency * 20)
    - (stagnationRate * 15)
    - (velocityPenalty * 25)
    - (overloadRatio * 20);
  
  // Constrain to 0-100
  const finalScore = Math.max(0, Math.min(100, score));
  
  // Update project with calculated score and metrics
  project.reliabilityScore = finalScore;
  project.healthMetrics = {
    blockerFrequency,
    stagnationRate,
    overloadRatio,
    velocityVariance
  };
  await project.save();
  
  // Integrate risk detection
  const riskService = require('./risk.service');
  await riskService.checkAndCreateAlerts(projectId, finalScore, project.healthMetrics);
  
  // Broadcast score update via Socket.io
  try {
    const socketService = require('./socket.service');
    socketService.broadcastScoreUpdate(projectId, finalScore, project.healthMetrics);
  } catch (error) {
    console.error('Error broadcasting score update:', error.message);
  }
  
  return finalScore;
};

/**
 * Recalculate reliability score when a task changes
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 */
const recalculateOnTaskChange = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) return;
  
  await calculateReliabilityScore(task.projectId);
};

/**
 * Recalculate reliability score when task assignment changes
 * @param {string} taskId - Task ID
 * @param {string} newAssigneeId - New assignee ID
 * @returns {Promise<void>}
 */
const recalculateOnAssignmentChange = async (taskId, newAssigneeId) => {
  const task = await Task.findById(taskId);
  if (!task) return;
  
  task.assigneeId = newAssigneeId;
  await task.save();
  
  await calculateReliabilityScore(task.projectId);
};

module.exports = {
  calculateBlockerFrequency,
  calculateStagnationRate,
  calculateOverloadRatio,
  calculateVelocityVariance,
  calculateReliabilityScore,
  recalculateOnTaskChange,
  recalculateOnAssignmentChange
};
