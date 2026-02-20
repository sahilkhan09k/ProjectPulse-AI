import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SimulationControls from './SimulationControls';
import SimulationResults from './SimulationResults';
import AIRecommendations from './AIRecommendations';
import { simulationAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';

function SimulationModal({ isOpen, onClose, project }) {
  const [params, setParams] = useState({
    removeMembers: 0,
    reduceDeadline: 0,
    increaseBlockers: 0
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  // Listen for real-time simulation results
  useEffect(() => {
    if (!socket) return;

    const handleSimulationCompleted = (data) => {
      if (project && data.projectId === project._id) {
        setResults(data.results);
        setLoading(false);
      }
    };

    socket.on('simulation:completed', handleSimulationCompleted);

    return () => {
      socket.off('simulation:completed', handleSimulationCompleted);
    };
  }, [socket, project]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setResults(null);
      setError(null);
      setParams({
        removeMembers: 0,
        reduceDeadline: 0,
        increaseBlockers: 0
      });
    }
  }, [isOpen]);

  const handleRunSimulation = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const response = await simulationAPI.run(project._id, params);
      
      // Results come from API response
      if (response.data && response.data.success) {
        setResults(response.data.data);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate team size from project data
  const teamSize = project?.teamSize || 6; // Default to 6 if not available

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Failure Simulation
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Model "what-if" scenarios to predict project outcomes
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Controls */}
                <div>
                  <SimulationControls
                    teamSize={teamSize}
                    onParamsChange={setParams}
                  />
                </div>

                {/* Right Column - Results */}
                <div>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-sm text-gray-600">Running simulation...</p>
                    </div>
                  ) : results ? (
                    <div className="space-y-6">
                      <SimulationResults results={results} />
                      {results.recommendations && (
                        <AIRecommendations recommendations={results.recommendations} />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full py-12">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          Adjust parameters and run simulation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleRunSimulation}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running...' : 'Run Simulation'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default SimulationModal;
