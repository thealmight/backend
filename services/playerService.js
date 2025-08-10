// services/playerService.js

const supabase = require('../db');

/**
 * Update the round number for a player by user ID.
 * @param {string} playerId - Supabase Auth user ID or users table PK.
 * @param {number} newRound - The round number to set.
 * @returns {Promise<boolean>} - True if update succeeded, false otherwise.
 */
async function updatePlayerRound(playerId, newRound) {
  if (!playerId || typeof newRound !== 'number') {
    console.error('❌ Invalid input: playerId and newRound are required');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ round: newRound })
      .eq('id', playerId)
      .select();

    if (error) {
      console.error(`❌ Failed to update round for player ${playerId}:`, error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ Updated round for player ${playerId} to ${newRound}`);
      return true;
    } else {
      console.warn(`⚠️ No player found with ID ${playerId}`);
      return false;
    }
  } catch (err) {
    console.error('❌ Unexpected error updating player round:', err.message);
    return false;
  }
}
/**
 * Update the round number for all players in a given game.
 * @param {string} gameId - The game ID.
 * @param {number} newRound - The round number to set.
 * @returns {Promise<number>} - Count of players updated.
 */
async function updateAllPlayersRound(gameId, newRound) {
  if (!gameId || typeof newRound !== 'number') {
    console.error('❌ Invalid input: gameId and newRound are required');
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ round: newRound })
      .eq('role', 'player')
      .eq('game_id', gameId)
      .select();

    if (error) {
      console.error(`❌ Failed to update rounds for game ${gameId}:`, error.message);
      return 0;
    }

    const count = data?.length || 0;
    console.log(`✅ Updated round to ${newRound} for ${count} players in game ${gameId}`);
    return count;
  } catch (err) {
    console.error('❌ Unexpected error updating all player rounds:', err.message);
    return 0;
  }
}

module.exports = {
  updatePlayerRound,
  updateAllPlayersRound // optional batch method
};

