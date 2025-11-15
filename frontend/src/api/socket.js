import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized. Call initSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected manually');
  }
};

// Helper functions for common socket events
export const joinList = (listId) => {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('join:list', listId);
  }
};

export const leaveList = (listId) => {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('leave:list', listId);
  }
};

export const updatePresence = (listId, activity) => {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('presence:update', { listId, activity });
  }
};

export const startTyping = (listId, todoId) => {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('typing:start', { listId, todoId });
  }
};

export const stopTyping = (listId, todoId) => {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('typing:stop', { listId, todoId });
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinList,
  leaveList,
  updatePresence,
  startTyping,
  stopTyping
};
