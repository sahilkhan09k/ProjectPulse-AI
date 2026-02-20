import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { projectsAPI } from '../services/api';
import Header from '../components/dashboard/Header';
import ReliabilityScoreCard from '../components/dashboard/ReliabilityScoreCard';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import RiskAlertsPanel from '../components/dashboard/RiskAlertsPanel';
import WorkloadSummary from '../components/dashboard/WorkloadSummary';
import TaskList from '../components/dashboard/TaskList';
import SimulationModal from '../components/simulation/SimulationModal';
import { ToastContainer } from '../components/common/Toast';

function DashboardPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [scoreUpdated, setScoreUpdated] = useState(false);
  const { socket, connected, joinProjectRoom, leaveProjectRoom } = useSocket();
  const { toasts, removeToast, success, info, warning } = useToast();

  // Memoize fetchProject to prevent recreation on every render
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      const projects = response.data.data;
      
      if (projects.length > 0) {
        setProject(projects[0]); // Use first project for demo
      } else {
        setError('No projects found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Join project room when project is loaded and socket is connected
  useEffect(() => {
    if (project && connected) {
      joinProjectRoom(project._id);
      return () => {
        leaveProjectRoom(project._id);
      };
    }
  }, [project, connected, joinProjectRoom, leaveProjectRoom]);

  // Listen for real-time score updates
  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdate = (data) => {
      if (project && data.projectId === project._id) {
        setProject((prev) => ({
          ...prev,
          reliabilityScore: data.score,
          healthMetrics: data.metrics
        }));
        
        // Add visual feedback
        setScoreUpdated(true);
        setTimeout(() => setScoreUpdated(false), 2000);
        
        // Show toast notification
        const scoreDiff = data.score - project.reliabilityScore;
        if (Math.abs(scoreDiff) > 1) {
          if (scoreDiff > 0) {
            success(`Reliability score improved to ${Math.round(data.score)}`);
          } else {
            warning(`Reliability score decreased to ${Math.round(data.score)}`);
          }
        }
      }
    };

    const handleSimulationCompleted = (data) => {
      if (project && data.projectId === project._id) {
        info('Simulation completed successfully');
      }
    };

    const handleRiskCreated = (data) => {
      if (project && data.projectId === project._id) {
        warning('New risk alert detected');
      }
    };

    const handleRiskResolved = (data) => {
      if (project && data.projectId === project._id) {
        success('Risk alert resolved');
      }
    };

    socket.on('score:updated', handleScoreUpdate);
    socket.on('simulation:completed', handleSimulationCompleted);
    socket.on('risk:created', handleRiskCreated);
    socket.on('risk:resolved', handleRiskResolved);

    return () => {
      socket.off('score:updated', handleScoreUpdate);
      socket.off('simulation:completed', handleSimulationCompleted);
      socket.off('risk:created', handleRiskCreated);
      socket.off('risk:resolved', handleRiskResolved);
    };
  }, [socket, project, success, warning, info]);

  // Memoize modal handlers
  const handleOpenSimulation = useCallback(() => setIsSimulationOpen(true), []);
  const handleCloseSimulation = useCallback(() => setIsSimulationOpen(false), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header project={null} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header project={null} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header project={project} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Connection status indicator */}
          {!connected && (
            <div className="mb-4 rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                ⚠ Real-time updates disconnected. Reconnecting...
              </p>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Score and Metrics */}
            <div className="lg:col-span-1 space-y-6">
              <div className={scoreUpdated ? 'animate-pulse' : ''}>
                <ReliabilityScoreCard score={project.reliabilityScore} />
              </div>
              <MetricsGrid metrics={project.healthMetrics} />
              <WorkloadSummary projectId={project._id} />
            </div>

            {/* Middle Column - Alerts */}
            <div className="lg:col-span-1">
              <RiskAlertsPanel projectId={project._id} />
            </div>

            {/* Right Column - Tasks */}
            <div className="lg:col-span-1">
              <TaskList projectId={project._id} />
            </div>
          </div>
        </div>
      </main>

      {/* Simulation Button - Fixed Bottom Right */}
      <button
        onClick={handleOpenSimulation}
        className="fixed bottom-6 right-6 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 flex items-center space-x-2 z-40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="font-medium">Simulate Failure</span>
      </button>

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={handleCloseSimulation}
        project={project}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default DashboardPage;
