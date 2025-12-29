'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../lib/auth';
import socket from '../../lib/socket';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Enter both username and password");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('=== LOGIN PROCESS STARTED ===');
      console.log('Username:', username);
      
      // 1. First, ensure socket is connected
      if (!socket.connected) {
        console.log('🔌 Socket not connected, connecting...');
        socket.connect();
        
        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'));
          }, 5000);
          
          if (socket.connected) {
            clearTimeout(timeout);
            resolve();
          } else {
            socket.once('connect', () => {
              clearTimeout(timeout);
              resolve();
            });
          }
        });
      }
      
      console.log('✅ Socket connected:', socket.id);
      
      // 2. Do the API login
      console.log('📡 Sending API login request...');
      const result = await loginUser({ username, password });
      
      if (!result.success) {
        alert(result.message || "Login failed");
        setIsLoading(false);
        return;
      }
      
      console.log('✅ API login successful');
      
      // 3. Send socket login event WITH acknowledgment
      console.log('📤 Sending socket login event...');
      socket.emit('login', { username }, (response) => {
        console.log('📩 Server acknowledgment:', response);
        
        if (response && response.success) {
          // Store username for future use
          localStorage.setItem('username', username);
          
          // Navigate to room
          router.push(`/room?username=${encodeURIComponent(username)}&socketId=${socket.id}&t=${Date.now()}`);
        } else {
          alert('Failed to register with socket server');
          setIsLoading(false);
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || "Connection error");
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
          🎤 BitKaraoke Web
        </h1>
        
        <input
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <input
          type="password"
          className="w-full p-3 mb-6 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full font-bold py-3 rounded-lg transition flex items-center justify-center ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-black'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : 'Continue'}
        </button>
        
        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-900 rounded text-sm">
          <div className="flex items-center mb-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${socket.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-300">
              Socket: {socket.connected ? 'Connected' : 'Disconnected'}
              {socket.id ? ` (${socket.id.substring(0, 8)}...)` : ''}
            </span>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Server: localhost:3000
          </div>
        </div>
        
        {/* Test button */}
        <button
          onClick={() => {
            console.log('=== DEBUG SOCKET ===');
            console.log('Socket:', socket);
            console.log('Connected:', socket.connected);
            console.log('ID:', socket.id);
            
            if (socket.connected) {
              console.log('Testing login emit...');
              socket.emit('login', { username: 'test123' }, (res) => {
                console.log('Response:', res);
              });
            }
          }}
          className="mt-4 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Debug Socket Connection
        </button>
      </div>
    </div>
  );
}