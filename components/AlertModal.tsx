"use client";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'warning':
        return {
          icon: '⚠️',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      default:
        return {
          icon: 'ℹ️',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${bgColor} rounded-lg p-6 w-full max-w-md mx-4 border`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
        </div>
        <p className="text-sm text-waterloo dark:text-manatee mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
