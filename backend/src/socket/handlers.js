import jwt from 'jsonwebtoken';

export const setupSocketHandlers = (io) => {
  // Socket.io authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join list rooms
    socket.on('join:list', (listId) => {
      socket.join(`list:${listId}`);
      console.log(`User ${socket.userId} joined list ${listId}`);
    });

    // Leave list rooms
    socket.on('leave:list', (listId) => {
      socket.leave(`list:${listId}`);
      console.log(`User ${socket.userId} left list ${listId}`);
    });

    // Presence updates
    socket.on('presence:update', (data) => {
      const { listId, activity } = data;
      
      if (listId) {
        socket.to(`list:${listId}`).emit('presence:update', {
          userId: socket.userId,
          activity,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ listId, todoId }) => {
      if (listId) {
        socket.to(`list:${listId}`).emit('typing:start', {
          userId: socket.userId,
          todoId
        });
      }
    });

    socket.on('typing:stop', ({ listId, todoId }) => {
      if (listId) {
        socket.to(`list:${listId}`).emit('typing:stop', {
          userId: socket.userId,
          todoId
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });
};
