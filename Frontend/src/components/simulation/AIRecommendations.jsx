import { motion } from 'framer-motion';
import { 
  LightBulbIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

function AIRecommendations({ recommendations }) {
  if (!recommendations) return null;

  const { summary, actionItems } = recommendations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-2 mb-4">
        <LightBulbIcon className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          AI Recovery Recommendations
        </h3>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Action Items */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Recommended Actions
        </h4>
        <div className="space-y-3">
          {actionItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start space-x-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item}</p>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-gray-300 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Note:</span> These recommendations are AI-generated based on project metrics. 
          Please review and adapt them to your specific context.
        </p>
      </div>
    </motion.div>
  );
}

export default AIRecommendations;
