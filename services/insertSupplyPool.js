// services/insertSupplyPool.js

const supabase = require('../db');

/**
 * Insert a supply pool row into the database.
 * @param {Object} params
 * @param {number} params.round - Round number.
 * @param {string} params.product - Product name.
 * @param {number} params.quantity - Quantity available in the pool.
 * @returns {Promise<Object>} - The inserted supply pool record.
 */
async function insertSupplyPool({ round, product, quantity }) {
  if (typeof round !== 'number' || !product || typeof quantity !== 'number') {
    throw new Error('Missing or invalid fields for supply pool insertion');
  }

  const { data, error } = await supabase
    .from('supply_pool')
    .insert([{ round, product, quantity }])
    .select()
    .single();

  if (error) {
    console.error('❌ Supply pool insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertSupplyPool;
