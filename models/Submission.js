const supabase = require('../db');

/**
 * Creates a new tariff submission in the database.
 * @param {Object} submission
 * @param {string} submission.gameId
 * @param {string} submission.userId
 * @param {string} submission.country
 * @param {Object} submission.tariffs - tariff data
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function createSubmission({ gameId, userId, country, tariffs }) {
  if (!gameId || !userId || !country || !tariffs) {
    return { success: false, error: 'Missing required fields' };
  }

  try {
    // Get current game round
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('current_round')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return { success: false, error: 'Game not found' };
    }

    const roundNumber = game.current_round;

    // Create tariff entries for each product
    const tariffEntries = Object.entries(tariffs).map(([product, rate]) => ({
      game_id: gameId,
      round_number: roundNumber,
      product,
      from_country: country,
      to_country: country, // This would need to be updated based on your logic
      rate,
      submitted_by: userId,
      submitted_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('tariff_rates')
      .insert(tariffEntries)
      .select();

    if (error) {
      console.error('❌ createSubmission error:', error.message);
      return { success: false, error: 'Failed to create submission' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ createSubmission error:', error.message);
    return { success: false, error: 'Failed to create submission' };
  }
}

/**
 * Fetches all tariff submissions for a given game and round.
 * @param {Object} params
 * @param {string} params.gameId
 * @param {number} [params.roundNumber]
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
async function getSubmissionsByRound({ gameId, roundNumber }) {
  try {
    let query = supabase
      .from('tariff_rates')
      .select('*')
      .eq('game_id', gameId);

    if (roundNumber) {
      query = query.eq('round_number', roundNumber);
    }

    query = query.order('submitted_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ getSubmissionsByRound error:', error.message);
      return { success: false, error: 'Failed to fetch submissions' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ getSubmissionsByRound error:', error.message);
    return { success: false, error: 'Failed to fetch submissions' };
  }
}

module.exports = {
  createSubmission,
  getSubmissionsByRound
};
