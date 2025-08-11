const supabase = require('../db'); // or wherever your Supabase client lives

/**
 * Initializes chat socket listeners for a connected client.
 * @param {Socket} socket - The connected socket instance.
 * @param {Server} io - The Socket.IO server instance.
 */
function initializeChatSocket(socket, io) {
  socket.on('chat:send', async ({ gameId, message }) => {
    try {
      const senderId = socket.user?.id;
      const senderCountry = socket.user?.country;

      if (!senderId || !gameId || !message) {
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

      await supabase.from('chat_messages').insert([chatEntry]);

      io.to(`country_${senderCountry}`).emit('chat:receive', chatEntry);
    } catch (err) {
      console.error('❌ Socket chat:send error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
}

module.exports = initializeChatSocket;
