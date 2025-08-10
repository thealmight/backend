// services/updatePlayerRound.js
const supabase = require('../db');

/**
 * Updates the current round for a player in the database.
 * @param {string} userId - Supabase user ID
 * @param {number} roundNumber - New round number
 */
async function updatePlayerRound(userId, roundNumber) {
  const { error } = await supabase
    .from('users')
    .update({ current_round: roundNumber })
    .eq('id', userId);

  if (error) {
    console.error(`❌ Failed to update round for user ${userId}`, error);
  }
}

module.exports = { updatePlayerRound };
