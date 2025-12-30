import { io } from "socket.io-client";

let socket: any = null;

export function getSocket() {
  if (typeof window === 'undefined') {
    // Server-side: return null or dummy socket
    return null;
  }
  
  if (!socket) {
    console.log('🔄 Creating new socket connection...');
    
    socket = io('https://www.cyloware.com', {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      withCredentials: true,
      path: '/socket.io/',
    });
    
    socket.on('connect', () => {
      console.log('✅ Socket connected to server! ID:', socket.id);
    });
    
    socket.on('connect_error', (err: any) => {
      console.error('❌ Socket connection error:', err.message);
    });
    
    socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
    });
  }
  
  return socket;
}

export default getSocket;
