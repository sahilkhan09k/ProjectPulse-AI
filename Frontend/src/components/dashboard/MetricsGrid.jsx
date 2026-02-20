import MetricCard from './MetricCard';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

function MetricsGrid({ metrics }) {
  if (!metrics) {
    return null;
  }

  const metricsData = [
    {
      name: 'Blocker Frequency',
      value: metrics.blockerFrequency || 0,
      icon: ExclamationTriangleIcon
    },
    {
      name: 'Stagnation Rate',
      value: metrics.stagnationRate || 0,
      icon: ClockIcon
    },
    {
      name: 'Overload Ratio',
      value: metrics.overloadRatio || 0,
      icon: UserGroupIcon
    },
    {
      name: 'Velocity Variance',
      value: metrics.velocityVariance || 0,
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metricsData.map((metric) => (
        <MetricCard
          key={metric.name}
          name={metric.name}
          value={metric.value}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}

export default MetricsGrid;
