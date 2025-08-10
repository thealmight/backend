// services/updatePlayerRound.js
const db = require('../db'); // adjust if you're using Supabase or another client
const { notifyClients } = require('../utils/realtime'); // optional: for Socket.IO or Supabase triggers

/**
 * Updates the player's round number in the database.
 * @param {string} userId - The player's unique ID.
 * @param {number} roundNumber - The round to update to.
 */
async function updatePlayerRound(userId, roundNumber) {
  if (!userId || typeof roundNumber !== 'number') {
    throw new Error('Invalid input: userId and roundNumber are required');
  }

  const query = `
    UPDATE players
    SET current_round = $1
    WHERE user_id = $2
    RETURNING *;
  `;

  const values = [roundNumber, userId];

  try {
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error(`Player with userId ${userId} not found`);
    }

    // Optional: notify frontend clients of round update
    await notifyClients('roundUpdated', {
      userId,
      roundNumber,
    });

    return result.rows[0];
  } catch (err) {
    console.error('❌ Failed to update player round:', err);
    throw err;
  }
}

module.exports = { updatePlayerRound };
