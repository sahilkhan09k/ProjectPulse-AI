import { motion } from 'framer-motion';

function MetricCard({ name, value, icon: Icon }) {
  // Format value as percentage
  const percentage = (value * 100).toFixed(1);

  // Determine color based on metric type and value
  const getColor = () => {
    // Higher is worse for these metrics
    if (value > 0.3) return 'text-red-600 bg-red-50';
    if (value > 0.15) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{name}</p>
          <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${getColor()}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MetricCard;
