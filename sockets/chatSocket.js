const supabase = require('../db');

/**
 * Initializes chat socket listeners for a connected client.
 * @param {Socket} socket - The connected socket instance.
 * @param {Server} io - The Socket.IO server instance.
 */
function initializeChatSocket(socket, io) {
  console.log(`💬 Chat socket initialized for ${socket.username} (${socket.country})`);

  socket.on('chat:send', async ({ gameId, message }) => {
    console.log('📥 chat:send received:', { gameId, message });

    try {
      const senderId = socket.userId || socket.user?.id;
      const senderCountry = socket.country || socket.user?.country;

      if (!senderId || !gameId || !message) {
        console.warn('⚠️ Missing fields in chat:send', { senderId, gameId, message });
        return socket.emit('error', { message: 'Missing required fields' });
      }

      const chatEntry = {
        game_id: gameId,
        sender_id: senderId,
        sender_country: senderCountry,
        message_type: 'text',
        content: message,
        timestamp: new Date().toISOString()
      };

      console.log('📝 Inserting chat message into DB:', chatEntry);

      const { error } = await supabase.from('chat_messages').insert([chatEntry]);

      if (error) {
        console.error('❌ Supabase insert error:', error.message);
        return socket.emit('error', { message: 'Failed to save message' });
      }

      console.log(`📡 Emitting chat:receive to country_${senderCountry}`);
      io.to(`country_${senderCountry}`).emit('chat:receive', chatEntry);
    } catch (err) {
      console.error('❌ Socket chat:send error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
}

module.exports = initializeChatSocket;
