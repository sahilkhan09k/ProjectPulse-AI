import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SimulationResults({ results }) {
  if (!results) return null;

  const { originalScore, simulatedScore, simulatedMetrics } = results;
  const scoreDifference = simulatedScore - originalScore;
  const isWorse = scoreDifference < 0;

  // Prepare data for chart
  const chartData = [
    {
      name: 'Blocker Freq',
      Original: (results.originalMetrics?.blockerFrequency || 0) * 100,
      Simulated: (simulatedMetrics.blockerFrequency || 0) * 100
    },
    {
      name: 'Stagnation',
      Original: (results.originalMetrics?.stagnationRate || 0) * 100,
      Simulated: (simulatedMetrics.stagnationRate || 0) * 100
    },
    {
      name: 'Overload',
      Original: (results.originalMetrics?.overloadRatio || 0) * 100,
      Simulated: (simulatedMetrics.overloadRatio || 0) * 100
    },
    {
      name: 'Velocity Var',
      Original: (results.originalMetrics?.velocityVariance || 0) * 100,
      Simulated: (simulatedMetrics.velocityVariance || 0) * 100
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Score Comparison */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Simulation Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Original Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Original Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(originalScore)}
            </p>
          </div>

          {/* Simulated Score */}
          <div className={`rounded-lg p-4 ${isWorse ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600 mb-1">Simulated Score</p>
            <p className={`text-3xl font-bold ${isWorse ? 'text-red-600' : 'text-green-600'}`}>
              {Math.round(simulatedScore)}
            </p>
          </div>
        </div>

        {/* Score Change Indicator */}
        <div className={`rounded-lg p-4 ${isWorse ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Score Change</span>
            <span className={`text-2xl font-bold ${isWorse ? 'text-red-600' : 'text-green-600'}`}>
              {scoreDifference > 0 ? '+' : ''}{scoreDifference.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {isWorse 
              ? '⚠ The simulated scenario would decrease project reliability'
              : '✓ The simulated scenario would improve project reliability'
            }
          </p>
        </div>
      </div>

      {/* Metrics Comparison Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Metrics Breakdown
        </h4>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `${value.toFixed(1)}%`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Original" fill="#6366f1" name="Original" />
              <Bar dataKey="Simulated" fill="#ef4444" name="Simulated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simulated Metrics Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Blocker Frequency</p>
          <p className="text-lg font-semibold text-gray-900">
            {(simulatedMetrics.blockerFrequency * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Stagnation Rate</p>
          <p className="text-lg font-semibold text-gray-900">
            {(simulatedMetrics.stagnationRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Overload Ratio</p>
          <p className="text-lg font-semibold text-gray-900">
            {(simulatedMetrics.overloadRatio * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Velocity Variance</p>
          <p className="text-lg font-semibold text-gray-900">
            {(simulatedMetrics.velocityVariance * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default SimulationResults;
