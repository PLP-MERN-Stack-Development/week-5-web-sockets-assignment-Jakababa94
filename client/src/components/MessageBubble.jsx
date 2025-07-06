import React, { useState } from 'react';
import { MoreHorizontal, Heart, ThumbsUp, Laugh, Angry, Salad as Sad, Sunrise as Surprise } from 'lucide-react';
import { Message } from '../hooks/useSocket';

/* PropTypes can be used below for prop validation if desired */

const reactions = [
  { emoji: '❤️', icon: Heart, name: 'heart' },
  { emoji: '👍', icon: ThumbsUp, name: 'thumbs_up' },
  { emoji: '😂', icon: Laugh, name: 'laugh' },
  { emoji: '😢', icon: Sad, name: 'sad' },
  { emoji: '😡', icon: Angry, name: 'angry' },
  { emoji: '😮', icon: Surprise, name: 'surprise' }
];

export const MessageBubble = ({ 
  message, 
  isOwn, 
  onReaction 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReactionClick = (reactionName) => {
    onReaction(message.id, reactionName);
    setShowReactions(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{message.avatar}</span>
            <span className="text-sm font-medium text-gray-300">{message.username}</span>
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          </div>
        )}
        
        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-2 shadow-lg ${
              isOwn
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            
            {isOwn && (
              <div className="text-xs text-gray-200 mt-1 text-right">
                {formatTime(message.timestamp)}
              </div>
            )}
          </div>

          {/* Reactions */}
          {Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([reaction, users]) => (
                <button
                  key={reaction}
                  onClick={() => handleReactionClick(reaction)}
                  className="bg-gray-600 hover:bg-gray-500 text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                >
                  <span>
                    {reactions.find(r => r.name === reaction)?.emoji || reaction}
                  </span>
                  <span className="text-gray-300">{users.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute top-full mt-2 bg-gray-800 border border-gray-600 rounded-lg p-2 flex gap-1 z-10 shadow-xl">
              {reactions.map((reaction) => (
                <button
                  key={reaction.name}
                  onClick={() => handleReactionClick(reaction.name)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title={reaction.name}
                >
                  <span className="text-lg">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Actions */}
      <div className={`${isOwn ? 'order-1 mr-2' : 'order-2 ml-2'} self-end opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};