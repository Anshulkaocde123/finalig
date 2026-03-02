/**
 * SocketContext — thin wrapper around the singleton socket instance.
 *
 * Instead of creating a second socket.io connection (which wastes
 * bandwidth and causes duplicate events), this re-exports the
 * single connection from ../socket.js so every component gets the
 * same reference via useSocket().
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../socket';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
