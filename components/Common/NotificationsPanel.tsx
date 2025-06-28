
import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';
import Button from './Button';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';
import { BookOpenIcon, HeartIcon, UserPlusIcon } from '@heroicons/react/24/solid';

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const baseClasses = "h-5 w-5 p-0.5 rounded-full";
    switch (type) {
        case 'reaction':
            return <HeartIcon className={`${baseClasses} text-pink-500 bg-pink-100 dark:bg-pink-800/50 dark:text-pink-400`} />;
        case 'comment':
        case 'reply':
            return <BookOpenIcon className={`${baseClasses} text-blue-500 bg-blue-100 dark:bg-blue-800/50 dark:text-blue-400`} />;
        case 'follow':
            return <UserPlusIcon className={`${baseClasses} text-green-500 bg-green-100 dark:bg-green-800/50 dark:text-green-400`} />;
        default:
            return null;
    }
};

const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 2) return `Yesterday`;
    if (days < 30) return `${days}d ago`;
    
    return new Date(dateString).toLocaleDateString();
};


const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotification();
  const { user } = useAuth();

  const handleMarkAllRead = () => {
    markAllAsRead(user?.id ?? null);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded-lg shadow-2xl ring-1 ring-black dark:ring-primary-700 ring-opacity-5 z-[55]">
      <div className="p-3 border-b border-secondary-200 dark:border-primary-700 flex justify-between items-center">
        <h3 className="font-semibold text-base">Notifications</h3>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} variant="ghost" size="sm">
            Mark all as read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-sm text-primary-600 dark:text-primary-400">
          You have no new notifications.
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto divide-y divide-secondary-100 dark:divide-primary-700 fancy-scrollbar">
          {notifications.map(notif => (
            <li key={notif.id} className={`transition-colors ${!notif.read ? 'bg-accent-50 dark:bg-primary-700/50' : 'hover:bg-secondary-100 dark:hover:bg-primary-700'}`}>
              <Link to={notif.link} onClick={onClose} className="block p-3">
                <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                        <img src={notif.actor.profilePictureUrl || DEFAULT_PROFILE_PICTURE} alt={notif.actor.username} className="h-9 w-9 rounded-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-primary-700 rounded-full p-0.5">
                            <NotificationIcon type={notif.type} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-primary-700 dark:text-primary-200">{notif.message}</p>
                        <p className="text-xs text-primary-500 dark:text-primary-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.read && <div className="mt-1 w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0" title="Unread"></div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      {/* Optional Footer can go here */}
    </div>
  );
};

export default NotificationsPanel;
