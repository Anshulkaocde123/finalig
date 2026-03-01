import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Determine URL based on environment
        const URL = import.meta.env.PROD
            ? window.location.origin
            : 'http://localhost:5001';

        const socket = io(URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
            setIsConnected(false);
        });

        socketRef.current = socket;

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
