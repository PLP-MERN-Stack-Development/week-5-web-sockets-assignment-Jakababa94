import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, Settings, Search, Smile, Phone, Video, MoreHorizontal } from 'lucide-react';
import { useSocket} from '../hooks/useSocket';
import { MessageBubble } from './MessageBubble';
import { UserList } from './UserList';
import { RoomList } from './RoomList';
import { EmojiPicker } from './EmojiPicker';
import { NotificationManager } from './NotificationManager';

/**
 * @param {Object} props
 * @param {Object} props.currentUser - The current user object
 */
export const ChatRoom = ({ currentUser }) => {
  const {
    users,
    rooms,
    messages,
    typingUsers,
    sendMessage,
    joinRoom,
    setTyping,
    addReaction
  } = useSocket();

  const [message, setMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const currentRoomData = rooms.find(r => r.id === currentRoom);
  const roomMessages = messages[currentRoom] || [];
  const roomTypingUsers = typingUsers[currentRoom] || [];

  const filteredMessages = searchTerm
    ? roomMessages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : roomMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [currentRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(currentRoom, message.trim());
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setTyping(currentRoom, true);
    
    const timeout = setTimeout(() => {
      setTyping(currentRoom, false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleRoomChange = (roomId) => {
    joinRoom(roomId, currentRoom);
    setCurrentRoom(roomId);
    setSearchTerm('');
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleReaction = (messageId, reaction) => {
    addReaction(messageId, currentRoom, reaction);
  };

  const onlineUsers = users.filter(user => user.online && user.currentRoom === currentRoom);
  const typingUsersNames = roomTypingUsers
    .map(userId => users.find(u => u.id === userId)?.username)
    .filter(Boolean);

  return (
    <div className="flex h-screen bg-gray-900">
      <NotificationManager />
      
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Chat Rooms</h1>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-hidden">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomChange={handleRoomChange}
            unreadCounts={{}}
          />
        </div>

        {/* User List Toggle */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="w-full flex items-center justify-between text-gray-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Online Users ({onlineUsers.length})</span>
            </div>
            <span className="text-green-400 text-sm">●</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-lg p-2">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{currentRoomData?.name}</h2>
              <p className="text-gray-400 text-sm">{currentRoomData?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.userId === currentUser.id}
              onReaction={handleReaction}
            />
          ))}
          
          {/* Typing Indicator */}
          {typingUsersNames.length > 0 && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {typingUsersNames.length === 1
                  ? `${typingUsersNames[0]} is typing...`
                  : `${typingUsersNames.join(', ')} are typing...`}
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={handleMessageChange}
                placeholder={`Message #${currentRoomData?.name || 'general'}`}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={1000}
              />
              
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0">
                  <EmojiPicker onSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* User List Sidebar */}
      {showUserList && (
        <div className="w-64 bg-gray-800 border-l border-gray-700">
          <UserList
            users={onlineUsers}
            currentUser={currentUser}
            onPrivateMessage={() => {}}
          />
        </div>
      )}
    </div>
  );
};