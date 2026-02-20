import { useAuth } from '../../hooks/useAuth';

function Header({ project }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!project) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ProjectPulse AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const daysRemaining = project.daysRemaining || 0;
  const isOverdue = project.isOverdue || daysRemaining < 0;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-gray-900">ProjectPulse AI</h1>
            <div className="hidden md:flex items-center space-x-4">
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.name}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>
                    {isOverdue ? (
                      <span className="text-red-600 font-medium">
                        ⚠ {Math.abs(daysRemaining)} days overdue
                      </span>
                    ) : (
                      <span>
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                      </span>
                    )}
                  </span>
                  <span>•</span>
                  <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
