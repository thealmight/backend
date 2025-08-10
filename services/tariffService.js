const supabase = require('../db');

/**
 * Submit multiple tariff changes for a player.
 * @param {string} userId - Supabase Auth user ID.
 * @param {string} gameId - Game ID.
 * @param {number} roundNumber - Current round number.
 * @param {Array} tariffChanges - Array of { product, toCountry, rate }
 * @returns {Promise<Array>} - Array of result objects per tariff
 */
async function submitTariffChanges(userId, gameId, roundNumber, tariffChanges) {
  if (!gameId || !roundNumber || !Array.isArray(tariffChanges)) {
    throw new Error('Invalid input');
  }

  const results = [];

  try {
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('country')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      throw new Error('Failed to fetch user country');
    }

    const userCountry = userProfile.country;

    for (const change of tariffChanges) {
      const { product, toCountry, rate } = change;

      if (rate < 0 || rate > 100) {
        results.push({ product, toCountry, error: 'Tariff rate must be between 0 and 100' });
        continue;
      }

      const { data: productionRecord } = await supabase
        .from('production')
        .select('*')
        .eq('country', userCountry)
        .eq('product', product)
        .single();

      if (!productionRecord) {
        results.push({ product, toCountry, error: `You do not produce ${product}` });
        continue;
      }

      const { error: upsertError } = await supabase
        .from('tariffs')
        .upsert({
          game_id: gameId,
          round_number: roundNumber,
          product,
          from_country: userCountry,
          to_country: toCountry,
          rate,
          updated_by: userId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: ['game_id', 'round_number', 'product', 'from_country', 'to_country']
        });

      if (upsertError) {
        results.push({ product, toCountry, error: upsertError.message });
      } else {
        results.push({ product, toCountry, success: true });
      }
    }

    return results;
  } catch (err) {
    console.error('❌ Tariff submission error:', err.message);
    throw err;
  }
}

/**
 * Persist a single tariff update (used by operator or system)
 * @param {Object} params - { gameId, round, productId, from, to, value }
 * @returns {Promise<boolean>}
 */
async function persistTariffUpdate({ gameId, round, productId, from, to, value }) {
  try {
    const { error } = await supabase
      .from('tariffs')
      .upsert({
        game_id: gameId,
        round_number: round,
        product: productId,
        from_country: from,
        to_country: to,
        rate: value,
        updated_by: 'system',
        updated_at: new Date().toISOString()
      }, {
        onConflict: ['game_id', 'round_number', 'product', 'from_country', 'to_country']
      });

    if (error) {
      console.error('❌ Failed to persist tariff:', error.message);
      return false;
    }

    console.log(`💾 Tariff persisted: ${from} → ${to} | ${productId} @ ${value} (Round ${round})`);
    return true;
  } catch (err) {
    console.error('❌ Tariff DB error:', err.message);
    return false;
  }
}

module.exports = {
  submitTariffChanges,
  persistTariffUpdate
};
