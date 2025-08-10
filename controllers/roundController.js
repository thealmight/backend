// controllers/roundController.js
const { updatePlayerRound } = require('../services/updatePlayerRound');

async function updatePlayerRoundHandler(req, res) {
  const { userId, roundNumber } = req.body;

  try {
    await updatePlayerRound(userId, roundNumber);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error in updatePlayerRoundHandler:', err);
    res.status(500).json({ error: 'Failed to update round' });
  }
}

module.exports = { updatePlayerRoundHandler };
