// services/insertProduction.js

const supabase = require('../db');

/**
 * Insert a production row into the database.
 * @param {Object} params
 * @param {string} params.game_id - Game ID.
 * @param {string} params.country - Country name.
 * @param {string} params.product - Product name.
 * @param {number} params.quantity - Quantity produced.
 * @returns {Promise<Object>} - The inserted production record.
 */
async function insertProduction({ game_id, country, product, quantity }) {
  if (!game_id || !country || !product || typeof quantity !== 'number') {
    throw new Error('Missing or invalid fields for production insertion');
  }

  const { data, error } = await supabase
    .from('production')
    .insert([{ game_id, country, product, quantity }])
    .select()
    .single();

  if (error) {
    console.error('❌ Production insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertProduction;
