import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RiskAlertCard from './RiskAlertCard';
import { risksAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';

function RiskAlertsPanel({ projectId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (projectId) {
      fetchAlerts();
    }
  }, [projectId]);

  // Listen for real-time alert updates
  useEffect(() => {
    if (!socket) return;

    const handleAlertCreated = (data) => {
      if (data.projectId === projectId) {
        setAlerts((prev) => [data.alert, ...prev]);
      }
    };

    const handleAlertResolved = (data) => {
      if (data.projectId === projectId) {
        setAlerts((prev) => prev.filter((alert) => alert._id !== data.alertId));
      }
    };

    socket.on('risk:created', handleAlertCreated);
    socket.on('risk:resolved', handleAlertResolved);

    return () => {
      socket.off('risk:created', handleAlertCreated);
      socket.off('risk:resolved', handleAlertResolved);
    };
  }, [socket, projectId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await risksAPI.getAll(projectId);
      setAlerts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Alerts</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Alerts</h3>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Alerts</h3>
        {alerts.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {alerts.length} active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No active risk alerts</p>
          <p className="text-xs text-gray-400 mt-1">Your project is healthy!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert) => (
              <RiskAlertCard
                key={alert._id}
                alert={alert}
                onResolve={handleResolve}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default RiskAlertsPanel;
