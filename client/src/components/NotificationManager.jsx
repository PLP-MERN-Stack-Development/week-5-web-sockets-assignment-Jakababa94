import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'message' | 'user_joined' | 'user_left'} type
 * @property {string} title
 * @property {string} message
 * @property {Date} timestamp
 */

export const NotificationManager= () => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((result) => {
          setPermission(result);
        });
      } else {
        setPermission(Notification.permission);
      }
    }
  }, []);

  const showNotification = (title, message, type = 'message') => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Browser notification
    if (permission === 'granted' && document.hidden) {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'chat-notification'
      });
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // This would be called by the socket events
  useEffect(() => {
    const handleNewMessage = (data) => {
      showNotification('New Message', `${data.username}: ${data.content}`, 'message');
      socket.on('new_message', handleNewMessage);
    };

    const handleUserJoined = (data) => {
      showNotification('User Joined', `${data.username} joined the chat`, 'user_joined');
      socket.on('user_joined', handleUserJoined);
    };

    const handleUserLeft = (data) => {
      showNotification('User Left', `${data.username} left the chat`, 'user_left');
      socket.on('user_left', handleUserLeft);
    };  

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm shadow-lg animate-slide-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                <p className="text-gray-300 text-xs mt-1">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};