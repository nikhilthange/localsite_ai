import { useEffect, useRef, useState, useCallback, useContext, createContext } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const ws = useWebsocket();
  return <SocketContext.Provider value={ws}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}

export function useWebsocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);
  const handlersRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
    });

    socket.on('reconnect_error', () => {});

    socket.on('reconnect_failed', () => {
      setIsConnected(false);
    });

    socket.on('generation:progress', (data) => {
      setLastEvent({ type: 'generation:progress', data });
    });

    socket.on('generation:complete', (data) => {
      setLastEvent({ type: 'generation:complete', data });
    });

    socket.on('deployment:status', (data) => {
      setLastEvent({ type: 'deployment:status', data });
    });

    socket.on('deployment:complete', (data) => {
      setLastEvent({ type: 'deployment:complete', data });
    });

    socket.on('deployment:error', (data) => {
      setLastEvent({ type: 'deployment:error', data });
    });

    socket.on('notification', (data) => {
      setLastEvent({ type: 'notification', data });
    });

    socket.on('payment:update', (data) => {
      setLastEvent({ type: 'payment:update', data });
    });

    socket.on('analytics:update', (data) => {
      setLastEvent({ type: 'analytics:update', data });
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, handler) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, handler);
    const handlers = handlersRef.current[event] || [];
    handlers.push(handler);
    handlersRef.current[event] = handlers;
    return () => {
      socketRef.current?.off(event, handler);
      handlersRef.current[event] = handlersRef.current[event]?.filter(h => h !== handler) || [];
    };
  }, []);

  const off = useCallback((event, handler) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  const joinWebsite = useCallback((websiteId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join:website', { websiteId });
    }
  }, []);

  const leaveWebsite = useCallback((websiteId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave:website', { websiteId });
    }
  }, []);

  return { isConnected, lastEvent, emit, on, off, joinWebsite, leaveWebsite, socket: socketRef.current };
}
