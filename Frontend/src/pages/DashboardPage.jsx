import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { projectsAPI } from '../services/api';
import Header from '../components/dashboard/Header';
import ReliabilityScoreCard from '../components/dashboard/ReliabilityScoreCard';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import RiskAlertsPanel from '../components/dashboard/RiskAlertsPanel';
import WorkloadSummary from '../components/dashboard/WorkloadSummary';
import TaskList from '../components/dashboard/TaskList';

function DashboardPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, connected, joinProjectRoom, leaveProjectRoom } = useSocket();

  useEffect(() => {
    fetchProject();
  }, []);

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
      }
    };

    socket.on('score:updated', handleScoreUpdate);

    return () => {
      socket.off('score:updated', handleScoreUpdate);
    };
  }, [socket, project]);

  const fetchProject = async () => {
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
  };

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
              <ReliabilityScoreCard score={project.reliabilityScore} />
              <MetricsGrid metrics={project.healthMetrics} />
            </div>

            {/* Middle Column - Alerts and Workload */}
            <div className="lg:col-span-1 space-y-6">
              <RiskAlertsPanel projectId={project._id} />
              <WorkloadSummary projectId={project._id} />
            </div>

            {/* Right Column - Tasks */}
            <div className="lg:col-span-1">
              <TaskList projectId={project._id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
