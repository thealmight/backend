const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

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

  const result = await chatController.sendMessage({ gameId, senderId, senderCountry, content });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({ message: 'Message sent', data: result.data });
});

/**
 * GET /chat/:gameId
 * Retrieves chat history for a game
 * Authenticated access
 */
router.get('/:gameId', authMiddleware, async (req, res) => {
  const { gameId } = req.params;

  const result = await chatController.getChatHistory(gameId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(200).json({ messages: result.data });
});

module.exports = router;
