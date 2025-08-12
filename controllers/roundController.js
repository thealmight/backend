// controllers/roundController.js
const { updatePlayerRound } = require('../services/updatePlayerRound');

async function updatePlayerRoundHandler(req, res) {
  const { userId, roundNumber } = req.body;

  try {
    const result = await updatePlayerRound(userId, roundNumber);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error in updatePlayerRoundHandler:', err);
    res.status(500).json({ error: 'Failed to update round', message: err.message });
  }
}

module.exports = {
  updatePlayerRoundHandler
};
