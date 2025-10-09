/**
 * Socket.io Service for WebRTC Signaling
 * Handles real-time video call connections between patients and doctors
 */

const setupSocketServer = (io) => {
  // Store active rooms and users
  const rooms = new Map();
  const users = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // User joins a consultation room
    socket.on('join-room', ({ roomId, userId, userName, userRole }) => {
      console.log(`👤 ${userName} (${userRole}) joining room: ${roomId}`);

      // Join the socket room
      socket.join(roomId);

      // Store user info
      users.set(socket.id, { userId, userName, userRole, roomId });

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      // Add user to room
      const room = rooms.get(roomId);
      room.add(socket.id);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        userRole
      });

      // Send current room participants to the new user
      const participants = Array.from(room)
        .filter(id => id !== socket.id)
        .map(id => users.get(id))
        .filter(user => user);

      socket.emit('room-participants', participants);

      console.log(`✅ Room ${roomId} now has ${room.size} participant(s)`);
    });

    // WebRTC Signaling: Offer
    socket.on('webrtc-offer', ({ roomId, offer, targetSocketId }) => {
      console.log(`📤 Sending offer from ${socket.id} to ${targetSocketId}`);
      
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        senderSocketId: socket.id,
        senderInfo: users.get(socket.id)
      });
    });

    // WebRTC Signaling: Answer
    socket.on('webrtc-answer', ({ roomId, answer, targetSocketId }) => {
      console.log(`📥 Sending answer from ${socket.id} to ${targetSocketId}`);
      
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        senderSocketId: socket.id
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('ice-candidate', ({ roomId, candidate, targetSocketId }) => {
      console.log(`🧊 Sending ICE candidate from ${socket.id} to ${targetSocketId}`);
      
      io.to(targetSocketId).emit('ice-candidate', {
        candidate,
        senderSocketId: socket.id
      });
    });

    // Chat message
    socket.on('chat-message', ({ roomId, message, senderId, senderName }) => {
      console.log(`💬 Chat message in room ${roomId} from ${senderName}`);
      
      io.to(roomId).emit('chat-message', {
        message,
        senderId,
        senderName,
        timestamp: new Date()
      });
    });

    // Toggle video
    socket.on('toggle-video', ({ roomId, enabled }) => {
      const user = users.get(socket.id);
      if (user) {
        socket.to(roomId).emit('user-video-toggle', {
          socketId: socket.id,
          userId: user.userId,
          enabled
        });
      }
    });

    // Toggle audio
    socket.on('toggle-audio', ({ roomId, enabled }) => {
      const user = users.get(socket.id);
      if (user) {
        socket.to(roomId).emit('user-audio-toggle', {
          socketId: socket.id,
          userId: user.userId,
          enabled
        });
      }
    });

    // Screen sharing
    socket.on('start-screen-share', ({ roomId }) => {
      const user = users.get(socket.id);
      if (user) {
        socket.to(roomId).emit('user-screen-share-started', {
          socketId: socket.id,
          userId: user.userId,
          userName: user.userName
        });
      }
    });

    socket.on('stop-screen-share', ({ roomId }) => {
      const user = users.get(socket.id);
      if (user) {
        socket.to(roomId).emit('user-screen-share-stopped', {
          socketId: socket.id,
          userId: user.userId
        });
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      handleUserLeave(socket, roomId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
      
      const user = users.get(socket.id);
      if (user && user.roomId) {
        handleUserLeave(socket, user.roomId);
      }
    });

    // Helper function to handle user leaving
    const handleUserLeave = (socket, roomId) => {
      const user = users.get(socket.id);
      
      if (user) {
        console.log(`👋 ${user.userName} leaving room: ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          userId: user.userId,
          userName: user.userName
        });

        // Remove from room
        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket.id);
          
          // Clean up empty rooms
          if (room.size === 0) {
            rooms.delete(roomId);
            console.log(`🗑️  Room ${roomId} is now empty and removed`);
          } else {
            console.log(`📊 Room ${roomId} now has ${room.size} participant(s)`);
          }
        }

        // Remove user
        users.delete(socket.id);
      }

      socket.leave(roomId);
    };
  });

  // Log active rooms periodically (for debugging)
  setInterval(() => {
    if (rooms.size > 0) {
      console.log(`📊 Active rooms: ${rooms.size}, Active users: ${users.size}`);
    }
  }, 60000); // Every minute

  console.log('✅ Socket.io server initialized for WebRTC signaling');
};

module.exports = { setupSocketServer };
