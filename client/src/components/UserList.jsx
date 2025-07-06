import React from 'react';
import PropTypes from 'prop-types';
import { MessageCircle, Crown, Circle } from 'lucide-react';

export const UserList = ({ 
  users, 
  currentUser, 
  onPrivateMessage 
}) => {
  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUser.id) return -1;
    if (b.id === currentUser.id) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Online Users</h3>
        <p className="text-sm text-gray-400">{users.length} members</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors ${
              user.id === currentUser.id ? 'bg-gray-700/50' : ''
            }`}
          >
            <div className="relative">
              <span className="text-2xl">{user.avatar}</span>
              <div className="absolute -bottom-1 -right-1">
                <Circle className="w-3 h-3 text-green-400 fill-current" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">
                  {user.username}
                </p>
                {user.id === currentUser.id && (
                  <Crown className="w-3 h-3 text-yellow-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {user.online ? 'Online' : 'Offline'}
              </p>
            </div>

            {user.id !== currentUser.id && (
              <button
                onClick={() => onPrivateMessage(user.id)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Send private message"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};