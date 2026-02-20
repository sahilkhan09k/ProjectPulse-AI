import { useEffect, useState } from 'react';
import { tasksAPI } from '../../services/api';

function WorkloadSummary({ projectId }) {
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchWorkloadData();
    }
  }, [projectId]);

  const fetchWorkloadData = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll(projectId);
      const tasks = response.data.data;

      // Group tasks by assignee
      const workloadMap = {};
      tasks.forEach((task) => {
        if (task.assigneeId && task.status !== 'done') {
          const assigneeId = task.assigneeId._id || task.assigneeId;
          const assigneeName = task.assigneeId.name || 'Unknown';

          if (!workloadMap[assigneeId]) {
            workloadMap[assigneeId] = {
              name: assigneeName,
              total: 0,
              todo: 0,
              inprogress: 0,
              blocked: 0
            };
          }

          workloadMap[assigneeId].total++;
          workloadMap[assigneeId][task.status]++;
        }
      });

      // Convert to array and sort by total tasks
      const workloadArray = Object.values(workloadMap).sort((a, b) => b.total - a.total);
      setWorkloadData(workloadArray);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workload data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  const maxTasks = Math.max(...workloadData.map((w) => w.total), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>

      {workloadData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No active tasks assigned</div>
      ) : (
        <div className="space-y-4">
          {workloadData.map((member) => {
            const isOverloaded = member.total > 5;
            const barWidth = (member.total / maxTasks) * 100;

            return (
              <div key={member.name} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
                  <span className={`text-sm font-semibold ${isOverloaded ? 'text-red-600' : 'text-gray-900'}`}>
                    {member.total} {member.total === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <div className="relative">
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverloaded ? 'bg-red-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute left-0 right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 inline-block">
                      <div className="space-y-1">
                        <div>Todo: {member.todo}</div>
                        <div>In Progress: {member.inprogress}</div>
                        <div>Blocked: {member.blocked}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {isOverloaded && (
                  <p className="text-xs text-red-600 mt-1">⚠ Overloaded (&gt;5 tasks)</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkloadSummary;
