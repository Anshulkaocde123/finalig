import { io } from 'socket.io-client';

// In development, connect to backend server directly
// In production, use same origin (frontend serves from backend)
const isDev = import.meta.env.DEV;
const SOCKET_URL = isDev ? 'http://localhost:5001' : window.location.origin;

console.log('🔌 Socket connecting to:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5001,
    timeout: 20000,
    connectTimeout: 45001,
    transports: ['websocket', 'polling'],
    withCredentials: false,
    upgrade: true,
    forceNew: false,
    multiplex: true,
    // Prevent premature disconnections
    pingTimeout: 60000,
    pingInterval: 25001
});

// Connection event handlers
socket.on('connect', () => {
    console.log('✅ Socket.io connected:', socket.id);
    console.log('🔌 Transport:', socket.io.engine.transport.name);
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt:', attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
    console.log('✅ Socket.io reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after all attempts');
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
    console.warn('⚠️  Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
        // Server initiated disconnect, manually reconnect
        console.log('🔄 Attempting manual reconnection...');
        socket.connect();
    }
});

socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
});

export default socket;
