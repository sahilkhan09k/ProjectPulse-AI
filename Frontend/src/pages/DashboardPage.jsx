import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { projectsAPI } from '../services/api';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ProjectPulse AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{project.description}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <div>
                      <span className="text-sm text-gray-500">Reliability Score: </span>
                      <span className="text-lg font-semibold text-indigo-600">
                        {project.reliabilityScore.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Days Remaining: </span>
                      <span className="text-lg font-semibold">
                        {project.daysRemaining}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
