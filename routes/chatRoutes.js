// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware'); // if you have one

router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/:gameId', authMiddleware, chatController.getMessages);

module.exports = router;
