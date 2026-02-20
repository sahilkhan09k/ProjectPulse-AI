/**
 * Socket Service
 * Handles real-time event broadcasting to connected clients
 */

class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize the socket service with io instance
   * @param {Object} io - Socket.io instance
   */
  initialize(io) {
    this.io = io;
    console.log('✅ Socket service initialized');
  }

  /**
   * Get the io instance
   * @returns {Object} - Socket.io instance
   */
  getIO() {
    if (!this.io) {
      throw new Error('Socket.io not initialized. Call initialize() first.');
    }
    return this.io;
  }

  /**
   * Broadcast reliability score update to project room
   * @param {string} projectId - Project ID
   * @param {number} reliabilityScore - Updated reliability score
   * @param {Object} metrics - Health metrics
   */
  broadcastScoreUpdate(projectId, reliabilityScore, metrics) {
    try {
      const io = this.getIO();
      io.to(`project:${projectId}`).emit('score:updated', {
        projectId,
        reliabilityScore,
        metrics,
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Broadcasted score update for project ${projectId}: ${reliabilityScore}`);
    } catch (error) {
      console.error('Error broadcasting score update:', error.message);
    }
  }

  /**
   * Broadcast simulation result to project room
   * @param {string} projectId - Project ID
   * @param {Object} result - Simulation result
   */
  broadcastSimulationResult(projectId, result) {
    try {
      const io = this.getIO();
      io.to(`project:${projectId}`).emit('simulation:completed', {
        projectId,
        result,
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Broadcasted simulation result for project ${projectId}`);
    } catch (error) {
      console.error('Error broadcasting simulation result:', error.message);
    }
  }

  /**
   * Broadcast risk alert created event to project room
   * @param {string} projectId - Project ID
   * @param {Object} alert - Risk alert object
   */
  broadcastRiskAlertCreated(projectId, alert) {
    try {
      const io = this.getIO();
      io.to(`project:${projectId}`).emit('risk:created', {
        projectId,
        alert,
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Broadcasted risk alert created for project ${projectId}`);
    } catch (error) {
      console.error('Error broadcasting risk alert created:', error.message);
    }
  }

  /**
   * Broadcast risk alert resolved event to project room
   * @param {string} projectId - Project ID
   * @param {string} alertId - Alert ID
   */
  broadcastRiskAlertResolved(projectId, alertId) {
    try {
      const io = this.getIO();
      io.to(`project:${projectId}`).emit('risk:resolved', {
        projectId,
        alertId,
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Broadcasted risk alert resolved for project ${projectId}`);
    } catch (error) {
      console.error('Error broadcasting risk alert resolved:', error.message);
    }
  }

  /**
   * Broadcast task update to project room
   * @param {string} projectId - Project ID
   * @param {Object} task - Updated task object
   */
  broadcastTaskUpdate(projectId, task) {
    try {
      const io = this.getIO();
      io.to(`project:${projectId}`).emit('task:updated', {
        projectId,
        task,
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Broadcasted task update for project ${projectId}`);
    } catch (error) {
      console.error('Error broadcasting task update:', error.message);
    }
  }
}

// Export singleton instance
module.exports = new SocketService();
