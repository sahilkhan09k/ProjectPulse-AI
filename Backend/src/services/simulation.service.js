const Project = require('../models/project.model');
const Task = require('../models/task.model');
const User = require('../models/user.model');

/**
 * Simulation Engine Service
 * Runs in-memory failure scenarios without modifying database
 */

/**
 * Calculate reliability score from in-memory data (no database writes)
 * @param {Array} tasks - Simulated tasks array
 * @param {Array} users - Simulated users array
 * @param {Date} deadline - Simulated deadline
 * @returns {Object} - Score and metrics
 */
const calculateReliabilityScoreFromData = (tasks, users, deadline) => {
  // Calculate blocker frequency
  const blockedCount = tasks.filter(t => t.status === 'blocked').length;
  const blockerFrequency = tasks.length > 0 ? blockedCount / tasks.length : 0;
  
  // Calculate stagnation rate
  const now = new Date();
  const staleThreshold = 48 * 60 * 60 * 1000; // 48 hours
  const staleCount = tasks.filter(t => {
    const timeSinceUpdate = now - new Date(t.updatedAt);
    return timeSinceUpdate > staleThreshold;
  }).length;
  const stagnationRate = tasks.length > 0 ? staleCount / tasks.length : 0;
  
  // Calculate overload ratio
  const activeTasks = tasks.filter(t => 
    t.status === 'todo' || t.status === 'inprogress'
  );
  
  const tasksByUser = {};
  activeTasks.forEach(t => {
    if (t.assigneeId) {
      const userId = t.assigneeId.toString();
      tasksByUser[userId] = (tasksByUser[userId] || 0) + 1;
    }
  });
  
  const overloadedCount = Object.values(tasksByUser)
    .filter(count => count > 5).length;
  const overloadRatio = users.length > 0 ? overloadedCount / users.length : 0;
  
  // Calculate velocity variance
  const completedTasks = tasks.filter(t => t.status === 'done');
  let velocityVariance = 0;
  
  if (completedTasks.length >= 2) {
    const weeklyCompletions = {};
    completedTasks.forEach(t => {
      const completedDate = new Date(t.updatedAt);
      const weekKey = getWeekKey(completedDate);
      weeklyCompletions[weekKey] = (weeklyCompletions[weekKey] || 0) + 1;
    });
    
    const rates = Object.values(weeklyCompletions);
    if (rates.length >= 2) {
      const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
      const variance = rates.reduce((sum, rate) => 
        sum + Math.pow(rate - mean, 2), 0
      ) / rates.length;
      velocityVariance = Math.min(1, variance / (mean + 1));
    }
  }
  
  // Apply deadline pressure modifier
  const daysRemaining = calculateDaysRemaining(deadline);
  const velocityPenalty = daysRemaining < 7 
    ? velocityVariance * 1.1 
    : velocityVariance;
  
  // Weighted formula
  const score = 100 
    - (blockerFrequency * 20)
    - (stagnationRate * 15)
    - (velocityPenalty * 25)
    - (overloadRatio * 20);
  
  const finalScore = Math.max(0, Math.min(100, score));
  
  return {
    score: finalScore,
    metrics: {
      blockerFrequency,
      stagnationRate,
      overloadRatio,
      velocityVariance
    },
    counts: {
      blockerCount: blockedCount,
      stagnationCount: staleCount,
      overloadMembers: overloadedCount
    }
  };
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
 * Run failure simulation
 * @param {string} projectId - Project ID
 * @param {Object} params - Simulation parameters
 * @param {number} params.removeMembers - Number of team members to remove
 * @param {number} params.reduceDeadline - Percentage to reduce deadline (0-50)
 * @param {number} params.increaseBlockers - Number of tasks to block
 * @returns {Promise<Object>} - Simulation results
 */
const runSimulation = async (projectId, params) => {
  const { removeMembers = 0, reduceDeadline = 0, increaseBlockers = 0 } = params;
  
  // Fetch current state (read-only)
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  const tasks = await Task.find({ projectId }).lean(); // .lean() for plain objects
  
  // Get unique assignee IDs
  const assigneeIds = [...new Set(
    tasks
      .filter(t => t.assigneeId)
      .map(t => t.assigneeId.toString())
  )];
  
  const users = await User.find({ _id: { $in: assigneeIds } }).lean();
  
  // Clone data for in-memory manipulation
  let simulatedTasks = JSON.parse(JSON.stringify(tasks));
  let simulatedUsers = users.slice(0, Math.max(0, users.length - removeMembers));
  
  // Calculate simulated deadline
  let simulatedDeadline = new Date(project.deadline);
  const daysToReduce = Math.round((reduceDeadline / 100) * 30);
  simulatedDeadline.setDate(simulatedDeadline.getDate() - daysToReduce);
  
  // Apply blocker increase
  const tasksToBlock = simulatedTasks
    .filter(t => t.status !== 'blocked' && t.status !== 'done')
    .slice(0, increaseBlockers);
  tasksToBlock.forEach(t => t.status = 'blocked');
  
  // Recalculate score with simulated data
  const simulatedResult = calculateReliabilityScoreFromData(
    simulatedTasks,
    simulatedUsers,
    simulatedDeadline
  );
  
  return {
    originalScore: project.reliabilityScore,
    simulatedScore: simulatedResult.score,
    simulatedMetrics: simulatedResult.metrics,
    forecast: {
      blockerIncrease: increaseBlockers,
      teamReduction: removeMembers,
      deadlineReduction: reduceDeadline
    },
    counts: simulatedResult.counts,
    daysRemaining: calculateDaysRemaining(simulatedDeadline)
  };
};

module.exports = {
  runSimulation,
  calculateReliabilityScoreFromData
};
