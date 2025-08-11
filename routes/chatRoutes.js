const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

console.log('📨 Chat routes initialized');

/**
 * POST /chat/message
 * Sends a new chat message
 * Body: { gameId, content }
 * Authenticated user info from authMiddleware
 */
router.post('/message', authMiddleware, async (req, res) => {
  const { gameId, content } = req.body;
  const senderId = req.user?.id;
  const senderCountry = req.user?.country;

  console.log('📝 POST /chat/message', { gameId, content, senderId, senderCountry });

  const result = await chatController.sendMessage({ gameId, senderId, senderCountry, content });

  if (!result.success) {
    console.warn('⚠️ Failed to send message:', result.error);
    return res.status(400).json({ error: result.error });
  }

  console.log('✅ Message sent:', result.data);
  res.status(201).json({ message: 'Message sent', data: result.data });
});

/**
 * GET /chat/:gameId
 * Retrieves chat history for a game
 * Authenticated access
 */
router.get('/:gameId', authMiddleware, async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user?.id;

  console.log(`📥 GET /chat/${gameId} requested by user ${userId}`);

  const result = await chatController.getChatHistory(gameId);

  if (!result.success) {
    console.warn('⚠️ Failed to fetch chat history:', result.error);
    return res.status(400).json({ error: result.error });
  }

  console.log(`📚 Chat history for ${gameId}: ${result.data.length} messages`);
  res.status(200).json({ messages: result.data });
});

module.exports = router;
