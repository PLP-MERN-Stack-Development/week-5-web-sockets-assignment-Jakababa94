import React from 'react';
import { Hash, Lock, Volume2 } from 'lucide-react';
import { Room } from '../hooks/useSocket';
import PropTypes from 'prop-types';

export const RoomList = ({
  rooms,
  currentRoom,
  onRoomChange,
  unreadCounts
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Text Channels
        </h3>
        
        <div className="space-y-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomChange(room.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                currentRoom === room.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="flex-1 truncate">{room.name}</span>
              
              {unreadCounts[room.id] > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                  {unreadCounts[room.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

RoomList.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentRoom: PropTypes.string.isRequired,
  onRoomChange: PropTypes.func.isRequired,
  unreadCounts: PropTypes.objectOf(PropTypes.number).isRequired,
};