const RiskAlert = require('../models/riskAlert.model');

/**
 * Risk Detection Service
 * Monitors reliability scores and generates/resolves risk alerts
 */

/**
 * Check reliability score and create/resolve alerts accordingly
 * @param {string} projectId - Project ID
 * @param {number} reliabilityScore - Current reliability score (0-100)
 * @param {Object} metrics - Health metrics object
 * @returns {Promise<void>}
 */
const checkAndCreateAlerts = async (projectId, reliabilityScore, metrics) => {
  if (reliabilityScore < 65) {
    // Determine primary risk factors
    const reasons = [];
    
    if (metrics.blockerFrequency > 0.15) {
      reasons.push(`${Math.round(metrics.blockerFrequency * 100)}% of tasks are blocked`);
    }
    if (metrics.stagnationRate > 0.10) {
      reasons.push(`${Math.round(metrics.stagnationRate * 100)}% of tasks are stale (>48h)`);
    }
    if (metrics.overloadRatio > 0.30) {
      reasons.push(`${Math.round(metrics.overloadRatio * 100)}% of team is overloaded (>5 tasks)`);
    }
    if (metrics.velocityVariance > 0.20) {
      reasons.push('Velocity is highly inconsistent');
    }
    
    // If no specific reasons, add generic reason
    if (reasons.length === 0) {
      reasons.push('Reliability score has fallen below acceptable threshold');
    }
    
    // Calculate confidence based on severity
    const severity = (65 - reliabilityScore) / 65;
    const confidence = Math.min(95, 60 + (severity * 35));
    
    // Check if an unresolved alert already exists for this project
    const existingAlert = await RiskAlert.findOne({ 
      projectId, 
      resolved: false 
    });
    
    if (!existingAlert) {
      // Create new alert
      const alert = await RiskAlert.create({
        projectId,
        type: reliabilityScore < 50 ? 'critical' : 'warning',
        reason: reasons.join('; '),
        confidence: Math.round(confidence),
        recommendedAction: 'Run failure simulation for recovery recommendations',
        resolved: false
      });
      
      // Broadcast risk alert created via Socket.io
      try {
        const socketService = require('./socket.service');
        socketService.broadcastRiskAlertCreated(projectId, alert);
      } catch (error) {
        console.error('Error broadcasting risk alert created:', error.message);
      }
    }
  } else {
    // Resolve existing alerts when score is healthy
    const resolvedAlerts = await RiskAlert.updateMany(
      { projectId, resolved: false },
      { 
        resolved: true, 
        resolvedAt: new Date() 
      }
    );
    
    // Broadcast risk alert resolved via Socket.io
    if (resolvedAlerts.modifiedCount > 0) {
      try {
        const socketService = require('./socket.service');
        // Get the resolved alert IDs
        const alerts = await RiskAlert.find({ 
          projectId, 
          resolved: true,
          resolvedAt: { $ne: null }
        }).sort({ resolvedAt: -1 }).limit(resolvedAlerts.modifiedCount);
        
        alerts.forEach(alert => {
          socketService.broadcastRiskAlertResolved(projectId, alert._id.toString());
        });
      } catch (error) {
        console.error('Error broadcasting risk alert resolved:', error.message);
      }
    }
  }
};

/**
 * Get all active (unresolved) alerts for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} - Array of active risk alerts
 */
const getActiveAlerts = async (projectId) => {
  return await RiskAlert.find({ 
    projectId, 
    resolved: false 
  }).sort({ createdAt: -1 });
};

/**
 * Manually resolve a specific alert
 * @param {string} alertId - Alert ID
 * @returns {Promise<Object>} - Updated alert document
 */
const resolveAlert = async (alertId) => {
  const alert = await RiskAlert.findById(alertId);
  
  if (!alert) {
    throw new Error('Alert not found');
  }
  
  if (alert.resolved) {
    throw new Error('Alert is already resolved');
  }
  
  alert.resolved = true;
  alert.resolvedAt = new Date();
  await alert.save();
  
  return alert;
};

module.exports = {
  checkAndCreateAlerts,
  getActiveAlerts,
  resolveAlert
};
