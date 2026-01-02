const { Server } = require('socket.io');

let io;

const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: ${socket.id}`);

        // User authentication
        socket.on('authenticate', (data) => {
            socket.userId = data.userId;
            socket.join(`user:${data.userId}`);
            console.log(`👤 User ${data.userId} authenticated`);
        });

        // Join auction room
        socket.on('join-auction', (data) => {
            const { listingId } = data;
            socket.join(`auction:${listingId}`);
            console.log(`🏠 Socket ${socket.id} joined auction:${listingId}`);
            
            // Notify others in the room
            socket.to(`auction:${listingId}`).emit('user-joined', {
                userId: socket.userId,
                listingId
            });
        });

        // Leave auction room
        socket.on('leave-auction', (data) => {
            const { listingId } = data;
            socket.leave(`auction:${listingId}`);
            console.log(`🚪 Socket ${socket.id} left auction:${listingId}`);
        });

        // Handle new bid
        socket.on('place-bid', async (data) => {
            const { listingId, amount, userId } = data;
            
            // Broadcast to all users in the auction room
            io.to(`auction:${listingId}`).emit('new-bid', {
                listingId,
                amount,
                userId,
                timestamp: new Date()
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    console.log('✅ Socket.IO initialized');
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

// Emit notification to specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Emit to auction room
const emitToAuction = (listingId, event, data) => {
    if (io) {
        io.to(`auction:${listingId}`).emit(event, data);
    }
};

// Broadcast to all connected clients
const broadcastToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitToUser,
    emitToAuction,
    broadcastToAll
};
