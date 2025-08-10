const supabase = require('../db');

/**
 * Initialize production and demand values for each country for a game.
 * @param {string} gameId - The game's UUID/ID.
 * @param {string[]} countries - Array of country names.
 * @param {number} roundNumber - Optional round number (default: 1)
 * @returns {Promise<boolean>} - Success status
 */
async function generateInitialValues(gameId, countries, roundNumber = 1) {
  const prodRows = [];
  const demRows = [];

  for (const country of countries) {
    prodRows.push({
      game_id: gameId,
      round_number: roundNumber,
      country,
      quantity: Math.floor(Math.random() * 100 + 50) // 50–149
    });

    demRows.push({
      game_id: gameId,
      round_number: roundNumber,
      country,
      value: Math.floor(Math.random() * 80 + 20) // 20–99
    });
  }

  try {
    const { error: prodError } = await supabase.from('production').insert(prodRows);
    const { error: demError } = await supabase.from('demand').insert(demRows);

    if (prodError || demError) {
      console.error('❌ Init error:', prodError || demError);
      return false;
    }

    console.log(`✅ Initialized production & demand for game ${gameId} (Round ${roundNumber})`);
    return true;
  } catch (err) {
    console.error('❌ InitGameData failed:', err.message);
    return false;
  }
}

module.exports = generateInitialValues;
