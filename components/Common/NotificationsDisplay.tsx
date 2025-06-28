

import React, { useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />;
    case 'error':
      return <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
    case 'info':
      return <InformationCircleIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />; 
    default:
      return null;
  }
};

const NotificationsDisplay: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 sm:top-24 right-4 z-[101] space-y-3 w-full max-w-sm"> 
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg flex items-start space-x-3 bg-white dark:bg-primary-800 border dark:border-l-4
            ${toast.type === 'success' ? 'border-green-400 dark:border-green-500' : ''}
            ${toast.type === 'error' ? 'border-red-400 dark:border-red-500' : ''}
            ${toast.type === 'warning' ? 'border-yellow-400 dark:border-yellow-500' : ''}
            ${toast.type === 'info' ? 'border-blue-400 dark:border-blue-500' : ''} 
            border-l-4 dark:border-opacity-80
          `}
        >
          <NotificationIcon type={toast.type} />
          <div className="flex-1">
            <p className={`text-sm font-medium 
              ${toast.type === 'success' ? 'text-green-700 dark:text-green-300' : ''}
              ${toast.type === 'error' ? 'text-red-700 dark:text-red-300' : ''}
              ${toast.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' : ''}
              ${toast.type === 'info' ? 'text-blue-700 dark:text-blue-300' : ''}
              ${!(toast.type === 'success' || toast.type === 'error' || toast.type === 'warning' || toast.type === 'info') ? 'text-primary-800 dark:text-primary-200' : ''}
            `}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 transition-colors`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationsDisplay;
