// services/insertGame.js

const supabase = require('../db');

/**
 * Insert a new game row into the database.
 * @param {Object} params
 * @param {number} params.total_rounds - Total number of rounds.
 * @param {string} params.operator_id - ID of the operator creating the game.
 * @returns {Promise<Object>} - The inserted game record.
 */
async function insertGame({ total_rounds, operator_id }) {
  if (typeof total_rounds !== 'number' || !operator_id) {
    throw new Error('Missing or invalid fields for game insertion');
  }

  const { data, error } = await supabase
    .from('games')
    .insert([{ total_rounds, operator_id, status: 'waiting' }])
    .select()
    .single();

  if (error) {
    console.error('❌ Game insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertGame;
