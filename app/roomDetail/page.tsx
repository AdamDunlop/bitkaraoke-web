'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import socket from '../../lib/socket';

export default function RoomDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const room = searchParams.get('room') || '';
  const username = searchParams.get('username') || '';
  
  const socketRef = useRef(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allScripts, setAllScripts] = useState([]);
  const [scriptData, setScriptData] = useState(null);
  const [characterAssignments, setCharacterAssignments] = useState({});
  const [sceneStarted, setSceneStarted] = useState(false);

  useEffect(() => {
    if (!username || !room) {
      router.push('/room?username=' + encodeURIComponent(username));
      return;
    }

    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', { room, username });
    });

    socket.on('roomState', ({ users, admin }) => {
      setRoomUsers(users || []);
      setIsAdmin(admin === username);
    });

    socket.on('scriptListFull', (scriptsArray) => {
      setAllScripts(scriptsArray);
    });

    socket.on('scriptSelected', ({ scriptData, admin }) => {
      setScriptData(scriptData);
      setIsAdmin(admin === username);
    });

    socket.on('characterAssignments', (assignments) => {
      setCharacterAssignments(assignments);
    });

    socket.on('sceneStarted', () => {
      setSceneStarted(true);
    });

    return () => {
      socket.emit('leaveRoom', { room });
      socket.disconnect();
    };
  }, [room, username, router]);

  const assignCharacter = (character) => {
    socketRef.current?.emit('assignCharacter', { room, character, username });
  };

  const startScene = () => {
    socketRef.current?.emit('startScene', { room });
  };

  const myCharacter = Object.keys(characterAssignments).find(
    (ch) => characterAssignments[ch] === username
  );

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
    infoText: {
      marginBottom: '8px',
    },
    backButton: {
      color: '#FFD700',
      marginBottom: '15px',
      cursor: 'pointer',
      display: 'inline-block',
    },
    section: {
      color: '#FFD700',
      fontSize: '20px',
      fontWeight: 'bold',
      marginTop: '20px',
      marginBottom: '10px',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      gap: '10px',
    },
    character: {
      width: '120px',
    },
    assignBtn: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    startBtn: {
      backgroundColor: '#FFD700',
      color: '#000',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '20px',
    },
    scriptBtn: {
      backgroundColor: '#222',
      color: '#fff',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #475569',
      margin: '4px',
      cursor: 'pointer',
    },
    videoContainer: {
      width: '100%',
      maxWidth: '640px',
      margin: '20px auto',
      backgroundColor: '#000',
      borderRadius: '8px',
      overflow: 'hidden',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🎤 BitKaraoke</h1>
      
      <div style={styles.backButton} onClick={() => router.push(`/room?username=${encodeURIComponent(username)}`)}>
        ← Back to Rooms
      </div>
      
      <p style={styles.infoText}>You are: {username} {isAdmin && "(Admin)"}</p>
      <p style={styles.infoText}>Room: {room}</p>
      <p style={styles.infoText}>Users in Room: {roomUsers.length}</p>

      {isAdmin && !scriptData && (
        <>
          <p style={styles.section}>Scripts</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allScripts.map((script) => (
              <button
                key={script.id}
                style={styles.scriptBtn}
                onClick={() => {
                  socketRef.current?.emit('selectScript', {
                    room,
                    scriptId: script.id,
                  });
                }}
              >
                {script.title}
              </button>
            ))}
          </div>
        </>
      )}

      {scriptData && !sceneStarted && scriptData.characters && (
        <>
          <p style={styles.section}>Characters</p>
          {scriptData.characters.map((character) => (
            <div key={character} style={styles.row}>
              <span style={styles.character}>{character}</span>
              <span style={{ color: '#94a3b8' }}>
                {characterAssignments[character]
                  ? `→ ${characterAssignments[character]}`
                  : '→ (unassigned)'}
              </span>
              
              {!characterAssignments[character] && (
                <button
                  style={styles.assignBtn}
                  onClick={() => assignCharacter(character)}
                >
                  Assign
                </button>
              )}
            </div>
          ))}
          
          {isAdmin && scriptData.characters.every((ch) => characterAssignments[ch]) && (
            <button style={styles.startBtn} onClick={startScene}>
              Start Scene 🎬
            </button>
          )}
        </>
      )}

      {scriptData?.imageUri && !sceneStarted && (
        <div style={styles.videoContainer}>
          <img 
            src={`https://www.cyloware.com/images/${scriptData.imageUri}`}
            alt="Scene"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      )}

      {myCharacter && (
        <p style={{ marginTop: '20px', color: '#FFD700' }}>
          Your character: <strong>{myCharacter}</strong>
        </p>
      )}
    </div>
  );
}
