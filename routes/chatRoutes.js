const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route POST /chat/message
 * @desc Send a new chat message
 * @access Protected
 */
router.post('/message', authMiddleware, async (req, res) => {
  const { gameId, content } = req.body;
  const senderId = req.user?.id;
  const senderCountry = req.user?.country;

  if (!gameId || !content || !senderId || !senderCountry) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await chatController.sendMessage({
      gameId,
      senderId,
      senderCountry,
      content
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(200).json(result.data);
  } catch (err) {
    console.error('❌ /chat/message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /chat/history/:gameId
 * @desc Get chat history for a game
 * @access Protected
 */
router.get('/history/:gameId', authMiddleware, async (req, res) => {
  const { gameId } = req.params;

  if (!gameId) {
    return res.status(400).json({ error: 'Missing gameId' });
  }

  try {
    const result = await chatController.getChatHistory(gameId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(200).json(result.data);
  } catch (err) {
    console.error('❌ /chat/history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
