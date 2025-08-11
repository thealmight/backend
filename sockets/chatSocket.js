// sockets/chatSocket.js
const supabase = require('../db');

module.exports = function handleChatSocket(socket, io) {
  //
  // 💬 Handle incoming chat messages
  //
  socket.on('sendMessage', async (data) => {
    try {
      const { gameId, content, messageType = 'group', recipientCountry } = data;

      if (!content || content.trim().length === 0) {
        return socket.emit('error', { message: 'Message content cannot be empty' });
      }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert([{
          game_id: gameId,
          sender_id: socket.userId,
          sender_country: socket.country,
          message_type: messageType,
          recipient_country: recipientCountry,
          content: content.trim(),
          sent_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error || !message) {
        return socket.emit('error', { message: 'Failed to save message' });
      }

      const messageData = {
        id: message.id,
        gameId,
        senderCountry: socket.country,
        messageType,
        recipientCountry,
        content: message.content,
        sentAt: message.sent_at
      };

      if (messageType === 'group') {
        io.to(`game_${gameId}`).emit('newMessage', messageData);
      } else if (messageType === 'private' && recipientCountry) {
        io.to(`country_${recipientCountry}`).emit('newMessage', messageData);
        socket.emit('newMessage', messageData); // Echo to sender
      }
    } catch (err) {
      console.error('❌ Chat socket error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};
