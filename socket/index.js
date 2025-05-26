const { Server } = require('socket.io');

let userSocketMap = {}; // Maps socket.id => userId
let adminSocket = null; // Track admin socket

function initSocket(server) {
    console.log('🔌 Initializing Socket.IO server');
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('🟢 New connection:', socket.id);

        // User joins with unique ID
        socket.on('user-join', (userId) => {
            console.log('👤 User joined:', { userId, socketId: socket.id });
            userSocketMap[socket.id] = userId;
            socket.join(userId);
            console.log('📝 Updated userSocketMap:', userSocketMap);
            if (adminSocket) {
                adminSocket.emit('user-connected', userId);
            }
        });

        // Admin joins
        socket.on('admin-join', () => {
            console.log('👨‍💼 Admin joined');
            adminSocket = socket;
            // Send list of connected users to admin
            const connectedUsers = Object.values(userSocketMap);
            adminSocket.emit('connected-users', connectedUsers);
        });

        // Generic message handler
        socket.on('message', (data) => {
            console.log('📨 Received message:', { data, socketId: socket.id });

            // User message: string
            if (typeof data === 'string') {
                const senderId = userSocketMap[socket.id];
                if (adminSocket) {
                    adminSocket.emit('message', { from: senderId, text: data });
                }
            }

            // Admin message: { to: 'User-123', text: 'Hello' }
            if (typeof data === 'object' && data.to && data.text) {
                console.log('📤 Sending admin message to user:', data.to);
                // Find the socket ID for the target user
                const targetSocketId = Object.keys(userSocketMap).find(
                    key => userSocketMap[key] === data.to
                );
                if (targetSocketId) {
                    io.to(targetSocketId).emit('message', data.text);
                }
            }
        });

        // On disconnect
        socket.on('disconnect', () => {
            const userId = userSocketMap[socket.id];
            console.log('🔴 Disconnection:', { socketId: socket.id, userId });
            
            if (userId) {
                delete userSocketMap[socket.id];
                if (adminSocket) {
                    adminSocket.emit('user-disconnected', userId);
                }
            }
            
            if (socket === adminSocket) {
                adminSocket = null;
                console.log('👨‍💼 Admin disconnected');
            }
        });
    });

    return io;
}

module.exports = { initSocket };