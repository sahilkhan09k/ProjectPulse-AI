import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { risksAPI } from '../../services/api';

function RiskAlertCard({ alert, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await risksAPI.resolve(alert._id);
      if (onResolve) {
        onResolve(alert._id);
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      setResolving(false);
    }
  };

  // Determine border color based on alert type
  const getBorderColor = () => {
    if (alert.type === 'critical') return 'border-l-red-500';
    return 'border-l-yellow-500';
  };

  // Determine badge color
  const getBadgeColor = () => {
    if (alert.type === 'critical') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Format confidence as percentage
  const confidencePercent = (alert.confidence * 100).toFixed(0);

  return (
    <motion.div
      className={`bg-white rounded-lg shadow border-l-4 ${getBorderColor()} overflow-hidden`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                {alert.type.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {confidencePercent}% confidence
              </span>
            </div>
            <p className="text-sm text-gray-900 font-medium">{alert.reason}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              aria-label="Dismiss alert"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-600">{alert.recommendedAction}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default RiskAlertCard;
