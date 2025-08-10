// services/demandService.js
const supabase = require('../db');

/**
 * Fetch demand data for a given game.
 * Optionally filter by country.
 * @param {string} gameId - The ID of the game.
 * @param {string|null} country - Optional country filter.
 * @returns {Promise<Array>} - Array of demand records.
 */
async function getDemand(gameId, country = null) {
  if (!gameId) throw new Error('gameId is required');

  let query = supabase
    .from('demand')
    .select('*')
    .eq('game_id', gameId);

  if (country) query = query.eq('country', country);

  const { data, error } = await query;
  if (error) {
    console.error('❌ Demand fetch error:', error.message);
    throw error;
  }

  return data || [];
}

module.exports = { getDemand };
