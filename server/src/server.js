import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import asteroidRoutes from './routes/asteroids.js';
import authRoutes from './routes/auth.js';
import watchlistRoutes from './routes/watchlist.js';
import alertRoutes from './routes/alert.js';
import { initScheduler } from './services/alertScheduler.js';
import { addMessage, getMessages } from './services/asteroidChatStore.js'; 

dotenv.config();

const app = express();
const httpServer = createServer(app); // Initialize HTTP server

// Configure Socket.io with CORS
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
].filter(Boolean);
if (allowedOrigins.length === 0) allowedOrigins.push('http://localhost:5173');

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request logging (so Docker logs show every API call)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Track active users per asteroid room
const roomUsers = new Map(); // Map<asteroidId, Set<{socketId, userId, userName}>>
const userTyping = new Map(); // Map<asteroidId, Set<userId>>

// Helper function to get users in a room
function getRoomUsers(asteroidId) {
    if (!roomUsers.has(asteroidId)) {
        roomUsers.set(asteroidId, new Set());
    }
    return Array.from(roomUsers.get(asteroidId));
}

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    // Join a specific asteroid's chat room
    socket.on('join_asteroid', async (data) => {
        const { asteroidId, userId, userName } = data || {};
        
        if (!asteroidId) {
            socket.emit('error', { message: 'Asteroid ID is required' });
            return;
        }

        try {
            socket.join(asteroidId);
            
            // Add user to room tracking
            const users = roomUsers.get(asteroidId) || new Set();
            users.add({ socketId: socket.id, userId, userName });
            roomUsers.set(asteroidId, users);

            // Fetch recent messages from database
            const messages = await getMessages(asteroidId, 100);
            
            // Send recent messages to the joining user
            socket.emit('load_messages', messages);
            
            // Notify other users in the room
            const activeUsers = getRoomUsers(asteroidId);
            io.to(asteroidId).emit('user_joined', { 
                userName, 
                activeUsers,
                totalUsers: activeUsers.length 
            });

            console.log(`User ${socket.id} (${userName}) joined room: ${asteroidId}`);
        } catch (err) {
            console.error('Error joining asteroid:', err);
            socket.emit('error', { message: 'Failed to join chat room' });
        }
    });

    // Handle sending real-time messages
    socket.on('send_message', async (data) => {
        const { asteroidId, userId, userName, text } = data || {};
        
        if (!asteroidId || !text) {
            socket.emit('error', { message: 'Invalid message data' });
            return;
        }

        try {
            // Add message to database
            const msg = await addMessage(asteroidId, { userId, userName, text });
            
            // Clear typing indicator when message is sent
            if (userTyping.has(asteroidId)) {
                userTyping.get(asteroidId).delete(userId);
            }
            
            // Broadcast the message to all users in that asteroid's room
            io.to(asteroidId).emit('receive_message', msg);
        } catch (err) {
            console.error('Error sending message:', err);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const { asteroidId, userId, userName, isTyping } = data || {};
        
        if (!asteroidId || !userId) return;

        if (isTyping) {
            if (!userTyping.has(asteroidId)) {
                userTyping.set(asteroidId, new Set());
            }
            userTyping.get(asteroidId).add(userId);
        } else {
            if (userTyping.has(asteroidId)) {
                userTyping.get(asteroidId).delete(userId);
            }
        }

        // Broadcast typing status to room (except sender)
        socket.broadcast.to(asteroidId).emit('user_typing', {
            userId,
            userName,
            isTyping,
            typingUsers: Array.from(userTyping.get(asteroidId) || [])
        });
    });

    // Leave asteroid room
    socket.on('leave_asteroid', (data) => {
        const { asteroidId, userName } = data || {};
        
        if (!asteroidId) return;

        socket.leave(asteroidId);

        // Remove user from tracking
        if (roomUsers.has(asteroidId)) {
            const users = roomUsers.get(asteroidId);
            users.forEach(user => {
                if (user.socketId === socket.id) users.delete(user);
            });
            if (users.size === 0) roomUsers.delete(asteroidId);
        }

        // Notify others
        const activeUsers = getRoomUsers(asteroidId);
        io.to(asteroidId).emit('user_left', {
            userName,
            activeUsers,
            totalUsers: activeUsers.length
        });

        console.log(`User ${socket.id} left room: ${asteroidId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        // Remove user from all rooms
        roomUsers.forEach((users, asteroidId) => {
            let removedUser = null;
            users.forEach(user => {
                if (user.socketId === socket.id) {
                    removedUser = user;
                    users.delete(user);
                }
            });

            if (removedUser) {
                const activeUsers = getRoomUsers(asteroidId);
                io.to(asteroidId).emit('user_left', {
                    userName: removedUser.userName,
                    activeUsers,
                    totalUsers: activeUsers.length
                });
            }

            if (users.size === 0) roomUsers.delete(asteroidId);
        });

        console.log('User disconnected from chat:', socket.id);
    });
});

// API Routes
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Cosmic Watch Backend Running', 
        status: 'OK' 
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/asteroids', asteroidRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 5000;

// Start httpServer – connect to DB first, then start listening
const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, async () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            await initScheduler();
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();

export default app;