import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import connectDB from './config/db.js';
import asteroidRoutes from './routes/asteroids.js';
import authRoutes from './routes/auth.js';
import watchlistRoutes from './routes/watchlist.js';
import alertRoutes from './routes/alert.js';
import { initScheduler } from './services/alertScheduler.js';
import { addMessage, getMessages } from './services/asteroidChatStore.js'; 

// Load .env from project root (supports both local dev and Docker)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config(); // Also try cwd for Docker/Railway where .env may be in /app

const app = express();
const httpServer = createServer(app); 

// Build allowed origins from env vars (supports Render, Railway, Docker, and local dev)
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,  // Render auto-injects this
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
].filter(Boolean);
if (allowedOrigins.length === 0) allowedOrigins.push('http://localhost:5173');
console.log('Allowed CORS origins:', allowedOrigins);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },
    transports: ['websocket', 'polling']
});

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


app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});


const roomUsers = new Map(); 
const userTyping = new Map(); 

function getRoomUsers(asteroidId) {
    if (!roomUsers.has(asteroidId)) {
        roomUsers.set(asteroidId, new Set());
    }
    return Array.from(roomUsers.get(asteroidId) || []);
}


io.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    
    socket.on('join_asteroid', async (data) => {
        const { asteroidId, userId, userName } = data || {};
        
        if (!asteroidId) {
            socket.emit('error', { message: 'Asteroid ID is required' });
            return;
        }

        try {
            socket.join(asteroidId);
            
           
            const users = roomUsers.get(asteroidId) || new Set();
            users.add({ socketId: socket.id, userId, userName });
            roomUsers.set(asteroidId, users);

            
            const messages = await getMessages(asteroidId, 100);
            
           
            socket.emit('load_messages', messages);
            
           
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

    
    socket.on('send_message', async (data) => {
        const { asteroidId, userId, userName, text } = data || {};
        
        if (!asteroidId || !text) {
            socket.emit('error', { message: 'Invalid message data' });
            return;
        }

        try {
            const msg = await addMessage(asteroidId, { userId, userName, text });
            
            if (userTyping.has(asteroidId)) {
                userTyping.get(asteroidId).delete(userId);
            }
            
            io.to(asteroidId).emit('receive_message', msg);
        } catch (err) {
            console.error('Error sending message:', err);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    
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

       
        socket.broadcast.to(asteroidId).emit('user_typing', {
            userId,
            userName,
            isTyping,
            typingUsers: Array.from(userTyping.get(asteroidId) || [])
        });
    });

   
    socket.on('leave_asteroid', (data) => {
        const { asteroidId, userName } = data || {};
        
        if (!asteroidId) return;

        socket.leave(asteroidId);

        if (roomUsers.has(asteroidId)) {
            const users = roomUsers.get(asteroidId);
            users.forEach(user => {
                if (user.socketId === socket.id) users.delete(user);
            });
            if (users.size === 0) roomUsers.delete(asteroidId);
        }

       
        const activeUsers = getRoomUsers(asteroidId);
        io.to(asteroidId).emit('user_left', {
            userName,
            activeUsers,
            totalUsers: activeUsers.length
        });

        console.log(`User ${socket.id} left room: ${asteroidId}`);
    });

   
    socket.on('disconnect', () => {
       
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


// Health check endpoint (used by Render / Railway / Docker)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        message: 'Perilux Backend Running', 
        status: 'OK' 
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Perilux Backend Running', 
        status: 'OK',
        docs: '/api'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/asteroids', asteroidRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);

// Serve frontend static files in production (Railway / Docker unified build)
const publicPath = join(__dirname, '..', 'public');
if (process.env.NODE_ENV === 'production' && existsSync(publicPath)) {
    app.use(express.static(publicPath));

    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(join(publicPath, 'index.html'));
        }
    });
    console.log(`Serving static frontend from ${publicPath}`);
}

const PORT = process.env.PORT || 5000;


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