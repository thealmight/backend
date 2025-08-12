const supabase = require('../db');
const gameDataStore = require('../stores/gameDataStore');

/**
 * Handles real-time chat events for a connected socket.
 * @param {Socket} socket - The connected user's socket
 * @param {Server} io - The Socket.IO server instance
 */
module.exports = function chatSocket(socket, io) {
  // 📨 Handle incoming chat message
  socket.on('chat:send', async ({ content }) => {
    const { gameId, userId, country, username } = socket;

    if (!content || !gameId || !userId || !country) {
      return socket.emit('error', { message: 'Missing required chat fields' });
    }

    const message = {
      game_id: gameId,
      sender_id: userId,
      sender_country: country,
      sender_username: username,
      message_type: 'text',
      content,
      timestamp: new Date().toISOString()
    };

    // Broadcast immediately via Socket.IO
    io.to(`game_${gameId}`).emit('chat:receive', message);

    // Persist to DB in background
    supabase.from('chat_messages').insert([message])
      .then(({ error }) => {
        if (error) {
          console.error('❌ Chat DB insert error:', error.message);
        }
      });
  });

  // 📜 Optional: Fetch chat history
  socket.on('chat:history', async () => {
    const { gameId } = socket;
    if (!gameId) return socket.emit('error', { message: 'Missing gameId' });

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('game_id', gameId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('❌ Chat history fetch error:', error.message);
      return socket.emit('error', { message: 'Failed to fetch chat history' });
    }

    socket.emit('chat:history', data);
  });
};
