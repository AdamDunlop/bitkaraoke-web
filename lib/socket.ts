// lib/socket.ts
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

// Create socket with auto-reconnect
const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
  forceNew: false,
  path: '/socket.io/',
  withCredentials: true,
});

// Debug: Log all events
socket.onAny((event, ...args) => {
  console.log(`📬 [Socket] "${event}"`, args.length ? args : '');
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  
  // Auto-send login if we have username stored
  const username = localStorage.getItem('username');
  if (username) {
    console.log('🔄 Auto-sending login for stored user:', username);
    setTimeout(() => {
      socket.emit('login', { username });
    }, 100);
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

// Store username when login is successful
socket.on('activeUsers', (users) => {
  console.log('👥 Server sent active users:', users);
});

export default socket;