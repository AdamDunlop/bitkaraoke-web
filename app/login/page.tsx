'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getSocket from '../../lib/socket';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState('checking');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize socket only on client
    if (typeof window !== 'undefined') {
      const sock = getSocket();
      setSocket(sock);
      
      if (sock) {
        const onConnect = () => {
          console.log('✅ Socket connected in component');
          setSocketStatus('connected');
        };
        
        const onError = (err: any) => {
          console.error('❌ Socket error in component:', err.message);
          setSocketStatus('error');
        };
        
        sock.on('connect', onConnect);
        sock.on('connect_error', onError);
        
        // Check current status
        if (sock.connected) {
          setSocketStatus('connected');
        }
        
        return () => {
          sock.off('connect', onConnect);
          sock.off('connect_error', onError);
        };
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim()) {
      alert("Enter a username");
      return;
    }

    setIsLoading(true);
    
    try {
      if (socket && socket.connected) {
        console.log('📤 Logging in via socket...');
        socket.emit('login', { username }, (response: any) => {
          console.log('📩 Server response:', response);
          if (response?.success) {
            router.push(`/room?username=${encodeURIComponent(username)}`);
          } else {
            alert(response?.message || 'Login failed');
            setIsLoading(false);
          }
        });
      } else {
        // Fallback: navigate without socket
        console.log('⚠️ No socket connection, using fallback');
        router.push(`/room?username=${encodeURIComponent(username)}&fallback=true`);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || "Error");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
          🎤 BitKaraoke Web
        </h1>
        
        <input
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoFocus
        />
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full font-bold py-3 rounded-lg transition ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-black'
          }`}
        >
          {isLoading ? 'Connecting...' : 'Enter'}
        </button>
        
        <div className="mt-4 p-3 bg-gray-900 rounded text-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              socketStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              socketStatus === 'error' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}></div>
            <span className="text-gray-300">
              {socketStatus === 'connected' ? '✅ Connected to server' :
               socketStatus === 'error' ? '❌ Socket error (fallback mode)' :
               '🔄 Connecting...'}
            </span>
          </div>
          {socket?.id && (
            <div className="text-gray-500 text-xs mt-1">
              Socket ID: {socket.id.substring(0, 8)}...
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          Testing connection to: cyloware.com
        </div>
      </div>
    </div>
  );
}
