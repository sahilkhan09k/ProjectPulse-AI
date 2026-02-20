import { useState, useEffect } from 'react';

function SimulationControls({ teamSize, onParamsChange }) {
  const [removeMembers, setRemoveMembers] = useState(0);
  const [reduceDeadline, setReduceDeadline] = useState(0);
  const [increaseBlockers, setIncreaseBlockers] = useState(0);

  // Notify parent of parameter changes
  useEffect(() => {
    if (onParamsChange) {
      onParamsChange({
        removeMembers,
        reduceDeadline,
        increaseBlockers
      });
    }
  }, [removeMembers, reduceDeadline, increaseBlockers, onParamsChange]);

  // Calculate max team removal (teamSize - 1, minimum 1 member must remain)
  const maxRemoveMembers = Math.max(0, teamSize - 1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Simulation Parameters
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Adjust the sliders to simulate different failure scenarios
        </p>
      </div>

      {/* Remove Team Members */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Remove Team Members
          </label>
          <span className="text-sm font-semibold text-indigo-600">
            {removeMembers} {removeMembers === 1 ? 'member' : 'members'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={maxRemoveMembers}
          value={removeMembers}
          onChange={(e) => setRemoveMembers(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{maxRemoveMembers}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Simulate team members leaving the project
        </p>
      </div>

      {/* Reduce Deadline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Reduce Deadline
          </label>
          <span className="text-sm font-semibold text-indigo-600">
            {reduceDeadline}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={reduceDeadline}
          onChange={(e) => setReduceDeadline(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Simulate deadline being moved up
        </p>
      </div>

      {/* Increase Blockers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Increase Blocked Tasks
          </label>
          <span className="text-sm font-semibold text-indigo-600">
            {increaseBlockers} {increaseBlockers === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="15"
          value={increaseBlockers}
          onChange={(e) => setIncreaseBlockers(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>15</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Simulate additional tasks becoming blocked
        </p>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setRemoveMembers(0);
          setReduceDeadline(0);
          setIncreaseBlockers(0);
        }}
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        Reset Parameters
      </button>
    </div>
  );
}

export default SimulationControls;
