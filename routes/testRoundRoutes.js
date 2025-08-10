// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { updatePlayerRound } = require('../services/playerService');

//
// 🧪 Test Route: Update Player Round
//

router.post('/test-round', async (req, res) => {
  const { playerId, round } = req.body;

  if (!playerId || typeof round !== 'number') {
    return res.status(400).json({ error: 'playerId and round are required and must be valid' });
  }

  try {
    const success = await updatePlayerRound(playerId, round);
    res.json({ success });
  } catch (err) {
    console.error('❌ Error in test-round:', err.message);
    res.status(500).json({ error: 'Failed to update player round' });
  }
});

module.exports = router;
