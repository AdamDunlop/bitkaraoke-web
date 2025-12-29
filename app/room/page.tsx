'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import socket from '../../lib/socket'; //

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';
  
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!username) {
      router.push('/login');
      return;
    }

    // const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    socket.emit('login', { username });

    socket.on('rooms', (roomList) => setRooms(roomList));
    socket.on('activeUsers', (users) => setActiveUsers(users));

    return () => {
      socket.disconnect();
    };
  }, [username, router]);

  const createRoom = () => {
    const trimmedName = newRoomName.trim();
    if (!trimmedName) {
      alert("Please enter a room name");
      return;
    }
    socketRef.current?.emit('createRoom', { roomName: trimmedName });
    setNewRoomName('');
  };

  const openRoom = (roomName) => {
    router.push(`/roomDetail?username=${encodeURIComponent(username)}&room=${encodeURIComponent(roomName)}`);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#111',
      padding: '20px',
      color: 'white',
    },
    header: {
      color: '#FFD700',
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center' as const,
    },
    subtitle: {
      fontSize: '18px',
      marginBottom: '6px',
    },
    row: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      marginBottom: '12px',
    },
    input: {
      backgroundColor: '#222',
      color: '#fff',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #333',
      flex: 1,
    },
    button: {
      backgroundColor: '#FFD700',
      color: '#000',
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    roomButton: {
      backgroundColor: '#333',
      color: '#fff',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '8px',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left' as const,
      border: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🎤 BitKaraoke</h1>
      <p style={styles.subtitle}>Welcome, {username}</p>
      <p style={styles.subtitle}>Users: {activeUsers.length}</p>

      <p style={styles.subtitle}>Create a Room</p>
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button style={styles.button} onClick={createRoom}>
          Create
        </button>
      </div>

      <p style={styles.subtitle}>Available Rooms</p>
      
      {rooms.length === 0 ? (
        <p style={{ color: '#aaa' }}>No rooms yet</p>
      ) : (
        rooms.map((room) => (
          <button
            key={room.name}
            style={styles.roomButton}
            onClick={() => openRoom(room.name)}
          >
            {room.name} <span style={{ color: '#94a3b8', fontSize: '14px' }}>({room.admin})</span>
          </button>
        ))
      )}
    </div>
  );
}
