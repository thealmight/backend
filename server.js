const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envFile });

const http = require('http');
const socketIo = require('socket.io');
const supabase = require('./db');
const { logAudit } = require('./utils/logAudit');
const emitGameData = require('./utils/emitGameData');
const app = require('./app');
const gameDataStore = require('./stores/gameDataStore');

const chatSocket = require('./sockets/chatSocket');
const gameSocket = require('./sockets/gameSocket');
const tradeSocket = require('./sockets/tradeSocket');

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 🔐 Socket.IO Auth Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No auth token provided'));

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return next(new Error('Supabase token invalid'));

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !dbUser) return next(new Error('User not found in DB'));

    socket.userId = dbUser.id;
    socket.username = dbUser.username;
    socket.role = dbUser.role;
    socket.country = dbUser.country;
    socket.gameId = dbUser.game_id;

    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// 🔌 Core Socket Connection Handler
io.on('connection', async (socket) => {
  console.log(`🔌 ${socket.username} (${socket.role}) connected from ${socket.country}`);

  // Add user to in-memory store
  gameDataStore.addUser(socket.userId, {
    userId: socket.userId,
    username: socket.username,
    country: socket.country,
    role: socket.role,
    gameId: socket.gameId
  });

  // Join rooms
  socket.join(`country_${socket.country}`);
  socket.join(`game_${socket.gameId}`);
  if (socket.role === 'operator') socket.join('operators');

  // Update online status in DB
  try {
    await supabase
      .from('users')
      .update({ socket_id: socket.id, is_online: true })
      .eq('id', socket.userId);

    // Emit user status update from memory
    io.emit('userStatusUpdate', {
      userId: socket.userId,
      username: socket.username,
      country: socket.country,
      isOnline: true
    });

    // Emit online users from memory
    socket.emit('onlineUsers', gameDataStore.getOnlineUsers());
  } catch (error) {
    console.error('Error updating user status:', error);
  }

  // 🔌 Plug in modular socket handlers
  chatSocket(socket, io);
  gameSocket(socket, io);
  tradeSocket(socket, io);

  // 🔁 Reconnect resilience
  socket.on('reconnectRequest', ({ userId, gameId, country }) => {
    socket.userId = userId;
    socket.gameId = gameId;
    socket.country = country;
    socket.join(`country_${country}`);
    socket.join(`game_${gameId}`);
    socket.emit('reconnected', { success: true });
  });

  // 💰 Tariff update broadcast
  socket.on('tariffUpdate', async (data) => {
    try {
      const updateData = {
        ...data,
        updatedBy: socket.username,
        updatedAt: new Date()
      };

      await logAudit(socket.userId, 'tariff_update', updateData);

      io.to('operators').emit('tariffUpdated', updateData);
      io.to(`country_${data.fromCountry}`).emit('tariffUpdated', updateData);
      io.to(`country_${data.toCountry}`).emit('tariffUpdated', updateData);
    } catch (error) {
      socket.emit('error', { message: 'Failed to update tariff' });
    }
  });

  // 🕒 Round timer update
  socket.on('roundTimerUpdate', async (data) => {
    if (socket.role !== 'operator') {
      return socket.emit('error', { message: 'Only operators can update round timer' });
    }

    try {
      await logAudit(socket.userId, 'round_timer_update', data);
      io.to(`game_${socket.gameId}`).emit('roundTimerUpdated', {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update round timer' });
    }
  });

  // 🎮 Game state update
  socket.on('gameStateUpdate', async (data) => {
    if (socket.role !== 'operator') {
      return socket.emit('error', { message: 'Only operators can update game state' });
    }

    try {
      await logAudit(socket.userId, 'game_state_update', data);
      io.to(`game_${socket.gameId}`).emit('gameStateChanged', {
        ...data,
        updatedBy: socket.username,
        updatedAt: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update game state' });
    }
  });

  // 🔄 Game data refresh
  socket.on('refreshGameData', async ({ gameId }) => {
    if (!gameId || gameId !== socket.gameId) {
      return socket.emit('error', { message: 'Invalid or unauthorized gameId' });
    }

    try {
      await emitGameData(io, gameId);
    } catch (err) {
      console.error('Failed to emit game data:', err.message);
      socket.emit('error', { message: 'Failed to refresh game data' });
    }
  });

  // 🔌 Disconnect handler
  socket.on('disconnect', async () => {
    console.log(`👋 ${socket.username} disconnected`);
    
    // Remove user from in-memory store
    gameDataStore.removeUser(socket.userId);
    
    // Update in DB
    try {
      await supabase
        .from('users')
        .update({ is_online: false, socket_id: null })
        .eq('id', socket.userId);

      // Emit user status update from memory
      io.emit('userStatusUpdate', {
        userId: socket.userId,
        username: socket.username,
        country: socket.country,
        isOnline: false
      });
    } catch (error) {
      console.error('Error updating user status on disconnect:', error);
    }
  });

  // ⚠️ Error event
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// 🚀 Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Econ Empire server running on port ${PORT}`);
  console.log(`📊 Supabase connected`);
  console.log(`🔌 WebSocket live`);
  console.log(`🌐 CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// 🧹 Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { server, io };
