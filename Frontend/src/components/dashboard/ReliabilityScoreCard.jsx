import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function ReliabilityScoreCard({ score, originalScore = null, isSimulation = false }) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score counter
  useEffect(() => {
    const targetScore = score || 0;
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = targetScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // Determine color based on score
  const getColor = (value) => {
    if (value >= 75) return { stroke: '#10b981', text: 'text-green-600', bg: 'bg-green-50' };
    if (value >= 50) return { stroke: '#f59e0b', text: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-50' };
  };

  const color = getColor(score);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Pulsing animation for critical scores
  const shouldPulse = score < 50;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Reliability Score
      </h3>

      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <motion.div
          className="relative"
          animate={shouldPulse ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke={color.stroke}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>

          {/* Score text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className={`text-5xl font-bold ${color.text}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(displayScore)}
              </motion.div>
              <div className="text-sm text-gray-500 mt-1">out of 100</div>
            </div>
          </div>
        </motion.div>

        {/* Original score display for simulation mode */}
        {isSimulation && originalScore !== null && (
          <motion.div
            className={`mt-4 px-4 py-2 rounded-md ${color.bg}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-gray-700">
              Original Score: <span className="font-semibold">{Math.round(originalScore)}</span>
            </p>
          </motion.div>
        )}

        {/* Status indicator */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color.bg} ${color.text}`}>
            {score >= 75 && '✓ Healthy'}
            {score >= 50 && score < 75 && '⚠ At Risk'}
            {score < 50 && '✗ Critical'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default ReliabilityScoreCard;
