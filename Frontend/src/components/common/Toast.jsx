import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

function Toast({ message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    error: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg ${backgrounds[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
