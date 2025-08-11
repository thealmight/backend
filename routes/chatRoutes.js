const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
console.log('🔍 chatController:', chatController);

// console.log('📨 Chat routes initialized');

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

  try {
    const result = await chatController.sendMessage({
      gameId,
      senderId,
      senderCountry,
      content
    });

    if (!result.success) {
      console.warn('⚠️ Failed to send message:', result.error);
      return res.status(400).json({ error: result.error });
    }

    console.log('✅ Message saved:', result.data);
    res.status(201).json({ message: 'Message sent', data: result.data });
  } catch (err) {
    console.error('❌ Unexpected error in /chat/message:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/message', authMiddleware, async (req, res) => {
  const { gameId, content } = req.body;
  const senderId = req.user?.id;
  const senderCountry = req.user?.country;

  console.log('📝 POST /chat/message', { gameId, content, senderId, senderCountry });

  try {
    const result = await chatController.sendMessage({
      gameId,
      senderId,
      senderCountry,
      content
    });

    if (!result.success) {
      console.warn('⚠️ Failed to send message:', result.error);
      return res.status(400).json({ error: result.error });
    }

    console.log('✅ Message saved:', result.data);
    res.status(201).json({ message: 'Message sent', data: result.data });
  } catch (err) {
    console.error('❌ Unexpected error in /chat/message:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
