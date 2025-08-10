// controllers/chatController.js

const insertChatMessage = require('../services/insertChatMessage');
const fetchChatMessages = require('../services/fetchChatMessages');
const { updatePlayerRound } = require('../services/updatePlayerRound');

// POST /api/chat/message
exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const sender_country = req.user.country;
    const { game_id, message_type, recipient_country, content, nextRound } = req.body;

    if (!sender_id || !sender_country) {
      return res.status(401).json({ error: 'Sender authentication required' });
    }

    if (!game_id || !message_type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = await insertChatMessage({
      game_id,
      sender_id,
      sender_country,
      message_type,
      recipient_country,
      content
    });

    // Optional: Update player round if provided
    if (nextRound) {
      await updatePlayerRound(sender_id, nextRound);
    }

    // Emit real-time chat message to recipient's country room
    const io = req.app.get('io');
    if (io && recipient_country) {
      io.to(`country_${recipient_country}`).emit('chat:newMessage', data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/chat/:gameId
exports.getMessages = async (req, res) => {
  try {
    const data = await fetchChatMessages(req.params.gameId);
    res.json(data);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ error: error.message });
  }
};

// socket/chatSocket.js
socket.on('chat:send', async ({ gameId, message }) => {
  const senderId = socket.user.id;

  await supabase.from('chat_messages').insert([{
    game_id: gameId,
    sender_id: senderId,
    message,
    timestamp: new Date().toISOString()
  }]);

  io.to(gameId).emit('chat:receive', { senderId, message });
});