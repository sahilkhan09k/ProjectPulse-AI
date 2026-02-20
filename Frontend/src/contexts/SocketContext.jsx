import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated, accessToken } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is authenticated and has access token
    if (!isAuthenticated || !user || !accessToken) {
      // Disconnect if socket exists
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection with JWT authentication via auth object
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket.io connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user, accessToken]);

  const joinProjectRoom = useCallback((projectId) => {
    if (socket && connected) {
      socket.emit('project:join', projectId);
      console.log(`Joined project room: ${projectId}`);
    }
  }, [socket, connected]);

  const leaveProjectRoom = useCallback((projectId) => {
    if (socket && connected) {
      socket.emit('project:leave', projectId);
      console.log(`Left project room: ${projectId}`);
    }
  }, [socket, connected]);

  const value = {
    socket,
    connected,
    joinProjectRoom,
    leaveProjectRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
