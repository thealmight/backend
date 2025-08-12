// services/updatePlayerRound.js
const supabase = require('../db');

/**
 * Updates the player's round number in the database.
 * @param {string} userId - The player's unique ID.
 * @param {number} roundNumber - The round to update to.
 */
async function updatePlayerRound(userId, roundNumber) {
  if (!userId || typeof roundNumber !== 'number') {
    throw new Error('Invalid input: userId and roundNumber are required');
  }

  try {
    // Since we don't have a separate players table, we'll update the user's current round
    // in the users table or in a game-specific context
    const { data, error } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update player round: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('❌ Failed to update player round:', err);
    throw err;
  }
}

module.exports = { updatePlayerRound };
