import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Custom event emitter for notifications
const notificationEmitter = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  },
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
};

export const useSocket = () => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState({});
  const [privateMessages, setPrivateMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      setReconnecting(false);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('reconnect_attempt', () => {
      setReconnecting(true);
    });

    socket.on('users_list', (usersList) => {
      setUsers(usersList);
      const user = usersList.find(u => u.id === socket.id);
      if (user) {
        setCurrentUser(user);
      }
    });

    socket.on('rooms_list', (roomsList) => {
      setRooms(roomsList);
    });

    socket.on('room_messages', ({ roomId, messages: roomMessages }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: roomMessages
      }));
    });

    socket.on('new_message', ({ roomId, message }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message]
      }));
      
      // Emit notification for new message
      if (message.userId !== socket.id) {
        notificationEmitter.emit('new_message', {
          username: message.username,
          content: message.content,
          roomId
        });
      }
    });

    socket.on('private_message', (message) => {
      setPrivateMessages(prev => [...prev, message]);
      
      // Emit notification for private message
      if (message.senderId !== socket.id) {
        notificationEmitter.emit('private_message', {
          senderName: message.senderName,
          content: message.content
        });
      }
    });

    socket.on('user_typing', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const roomId = currentUser?.currentRoom || 'general';
        const roomTyping = prev[roomId] || [];
        
        if (isTyping) {
          return {
            ...prev,
            [roomId]: [...roomTyping.filter(id => id !== userId), userId]
          };
        } else {
          return {
            ...prev,
            [roomId]: roomTyping.filter(id => id !== userId)
          };
        }
      });
    });

    socket.on('reaction_updated', ({ messageId, reactions }) => {
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(roomId => {
          updated[roomId] = updated[roomId].map(msg => 
            msg.id === messageId ? { ...msg, reactions } : msg
          );
        });
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const connect = (username, avatar) => {
    if (socketRef.current) {
      socketRef.current.connect();
      socketRef.current.emit('join', { username, avatar });
    }
  };

  const sendMessage = (roomId, content, type = 'text') => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { roomId, content, type });
    }
  };

  const sendPrivateMessage = (recipientId, content) => {
    if (socketRef.current) {
      socketRef.current.emit('send_private_message', { recipientId, content });
    }
  };

  const joinRoom = (roomId, previousRoom) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', { roomId, previousRoom });
    }
  };

  const setTyping = (roomId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { roomId, isTyping });
    }
  };

  const addReaction = (messageId, roomId, reaction) => {
    if (socketRef.current) {
      socketRef.current.emit('add_reaction', { messageId, roomId, reaction });
    }
  };

  return {
    connected,
    reconnecting,
    users,
    rooms,
    messages,
    privateMessages,
    typingUsers,
    currentUser,
    connect,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    setTyping,
    addReaction,
    notificationEmitter
  };
};