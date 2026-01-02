import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

/**
 * SocketProvider Component
 * Provides Socket.IO connection to all child components
 */
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO client
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('⚠️ Reconnection error:', error.message);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after max attempts');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up Socket.IO connection');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * useSocket Hook
 * Access Socket.IO connection from any component
 */
export function useSocket() {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
}

/**
 * useListingRoom Hook
 * Automatically join/leave a listing room for real-time updates
 */
export function useListingRoom(listingId) {
  const { socket, isConnected } = useSocket();
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !listingId) return;

    // Join listing room
    socket.emit('listing:join', { listingId });

    // Listen for join confirmation
    const handleJoined = (data) => {
      if (data.listingId === listingId) {
        setIsJoined(true);
        console.log(`✅ Joined listing room: ${listingId}`);
      }
    };

    socket.on('listing:joined', handleJoined);

    // Cleanup: leave room on unmount
    return () => {
      socket.off('listing:joined', handleJoined);
      socket.emit('listing:leave', { listingId });
      setIsJoined(false);
      console.log(`👋 Left listing room: ${listingId}`);
    };
  }, [socket, isConnected, listingId]);

  return { socket, isConnected, isJoined };
}
