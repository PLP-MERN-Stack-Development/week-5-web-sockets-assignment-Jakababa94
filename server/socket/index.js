const Message = require('../models/Message');
const User = require('../models/User');

// Store connected users and messages
const users = {};
const rooms = [
  { id: 'general', name: 'General', description: 'General chat room', users: [], messages: [] },
  { id: 'random', name: 'Random', description: 'Random topics', users: [], messages: [] },
  { id: 'help', name: 'Help', description: 'Get help here', users: [], messages: [] }
];
const messages = {};
const typingUsers = {};

module.exports = (io) => {
  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on('join', async (userData) => {
      const { username, avatar } = userData;
      users[socket.id] = { 
        id: socket.id, 
        username, 
        avatar, 
        online: true, 
        lastSeen: new Date(),
        currentRoom: 'general'
      };
      
      // Add user to general room
      const generalRoom = rooms.find(r => r.id === 'general');
      if (generalRoom && !generalRoom.users.includes(socket.id)) {
        generalRoom.users.push(socket.id);
      }
      
      // Emit updated lists
      io.emit('users_list', Object.values(users));
      io.emit('rooms_list', rooms);
      
      console.log(`${username} joined the chat`);

      // Save to database
      try {
        await User.create({ username, avatar });
      } catch (error) {
        console.error("Error saving to database:", error.message);
      }
    });

    // Handle room joining
    socket.on('join_room', ({ roomId, previousRoom }) => {
      const user = users[socket.id];
      if (user) {
        user.currentRoom = roomId;
        
        // Remove from previous room
        if (previousRoom) {
          const prevRoom = rooms.find(r => r.id === previousRoom);
          if (prevRoom) {
            prevRoom.users = prevRoom.users.filter(id => id !== socket.id);
          }
        }
        
        // Add to new room
        const newRoom = rooms.find(r => r.id === roomId);
        if (newRoom && !newRoom.users.includes(socket.id)) {
          newRoom.users.push(socket.id);
        }
        
        // Send room messages
        const roomMessages = messages[roomId] || [];
        socket.emit('room_messages', { roomId, messages: roomMessages });
        
        io.emit('users_list', Object.values(users));
        io.emit('rooms_list', rooms);
      }
    });

    // Handle chat messages
    socket.on('send_message', async (messageData) => {
      const { roomId, content, type = 'text' } = messageData;
      const user = users[socket.id];
      
      if (user) {
        const message = {
          id: Date.now().toString(),
          userId: socket.id,
          username: user.username,
          avatar: user.avatar,
          content,
          type,
          timestamp: new Date(),
          reactions: {},
          readBy: [socket.id]
        };
        
        // Add to room messages
        if (!messages[roomId]) {
          messages[roomId] = [];
        }
        messages[roomId].push(message);
        
        // Limit stored messages to prevent memory issues
        if (messages[roomId].length > 100) {
          messages[roomId].shift();
        }

        // Save to MongoDB
        try {
          const msg = new Message({
            ...message,
            roomId,
            senderId: socket.id,
            senderName: user.username
          });
          await msg.save();
        } catch (error) {
          console.log("Failed to save message to DB:", error.message);
        }
        
        io.emit('new_message', { roomId, message });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ roomId, isTyping }) => {
      const user = users[socket.id];
      if (user) {
        if (isTyping) {
          if (!typingUsers[roomId]) {
            typingUsers[roomId] = [];
          }
          if (!typingUsers[roomId].includes(socket.id)) {
            typingUsers[roomId].push(socket.id);
          }
        } else {
          if (typingUsers[roomId]) {
            typingUsers[roomId] = typingUsers[roomId].filter(id => id !== socket.id);
          }
        }
        
        io.emit('user_typing', { 
          userId: socket.id, 
          username: user.username, 
          isTyping 
        });
      }
    });

    // Handle reactions
    socket.on('add_reaction', ({ messageId, roomId, reaction }) => {
      const roomMessages = messages[roomId] || [];
      const message = roomMessages.find(msg => msg.id === messageId);
      
      if (message) {
        if (!message.reactions[reaction]) {
          message.reactions[reaction] = [];
        }
        
        if (!message.reactions[reaction].includes(socket.id)) {
          message.reactions[reaction].push(socket.id);
        }
        
        io.emit('reaction_updated', { messageId, reactions: message.reactions });
      }
    });

    // Handle private messages
    socket.on('send_private_message', ({ recipientId, content }) => {
      const sender = users[socket.id];
      const recipient = users[recipientId];
      
      if (sender && recipient) {
        const message = {
          id: Date.now().toString(),
          senderId: socket.id,
          recipientId,
          senderName: sender.username,
          senderAvatar: sender.avatar,
          content,
          timestamp: new Date(),
          read: false
        };
        
        socket.to(recipientId).emit('private_message', message);
        socket.emit('private_message', message);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (users[socket.id]) {
        const { username } = users[socket.id];
        users[socket.id].online = false;
        users[socket.id].lastSeen = new Date();
        
        // Remove from all rooms
        rooms.forEach(room => {
          room.users = room.users.filter(id => id !== socket.id);
        });
        
        // Clear typing indicators
        Object.keys(typingUsers).forEach(roomId => {
          typingUsers[roomId] = typingUsers[roomId].filter(id => id !== socket.id);
        });
        
        console.log(`${username} left the chat`);
        
        io.emit('users_list', Object.values(users));
        io.emit('rooms_list', rooms);
      }
    });
  });
};