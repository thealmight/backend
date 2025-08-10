// services/insertDemand.js

const supabase = require('../db');

/**
 * Insert a demand row into the database.
 * @param {Object} params
 * @param {string} params.game_id - Game ID.
 * @param {string} params.country - Country name.
 * @param {string} params.product - Product name.
 * @param {number} params.quantity - Quantity demanded.
 * @returns {Promise<Object>} - The inserted demand record.
 */
async function insertDemand({ game_id, country, product, quantity }) {
  if (!game_id || !country || !product || typeof quantity !== 'number') {
    throw new Error('Missing or invalid fields for demand insertion');
  }

  const { data, error } = await supabase
    .from('demand')
    .insert([{ game_id, country, product, quantity }])
    .select()
    .single();

  if (error) {
    console.error('❌ Demand insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertDemand;
