// services/insertTariffRate.js

const supabase = require('../db');

/**
 * Insert a tariff rate row into the database.
 * @param {Object} params
 * @param {string} params.game_id - Game ID.
 * @param {number} params.round_number - Round number.
 * @param {string} params.product - Product name.
 * @param {string} params.from_country - Origin country.
 * @param {string} params.to_country - Destination country.
 * @param {number} params.rate - Tariff rate (0–100).
 * @param {string} params.submitted_by - User ID of the submitter.
 * @returns {Promise<Object>} - The inserted tariff rate record.
 */
async function insertTariffRate({
  game_id,
  round_number,
  product,
  from_country,
  to_country,
  rate,
  submitted_by
}) {
  if (
    !game_id || typeof round_number !== 'number' ||
    !product || !from_country || !to_country ||
    typeof rate !== 'number' || !submitted_by
  ) {
    throw new Error('Missing or invalid fields for tariff rate insertion');
  }

  const { data, error } = await supabase
    .from('tariff_rates')
    .insert([{
      game_id,
      round_number,
      product,
      from_country,
      to_country,
      rate,
      submitted_by,
      submitted_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Tariff rate insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertTariffRate;
