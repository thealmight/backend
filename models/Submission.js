const supabase = require('../db');

/**
 * Inserts a new submission into the database.
 * @param {Object} submission
 * @param {string} submission.gameId
 * @param {string} submission.userId
 * @param {string} submission.country
 * @param {string} submission.type - e.g. 'tariff', 'production', etc.
 * @param {Object} submission.payload - actual submission data
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function createSubmission({ gameId, userId, country, type, payload }) {
  if (!gameId || !userId || !type || !payload) {
    return { success: false, error: 'Missing required fields' };
  }

  const entry = {
    game_id: gameId,
    user_id: userId,
    country,
    type,
    payload,
    timestamp: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('submissions')
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error('❌ createSubmission error:', error.message);
    return { success: false, error: 'Failed to create submission' };
  }

  return { success: true, data };
}

/**
 * Fetches all submissions for a given game and round.
 * @param {string} gameId
 * @param {number} roundNumber
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
async function getSubmissionsByRound(gameId, roundNumber) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('❌ getSubmissionsByRound error:', error.message);
    return { success: false, error: 'Failed to fetch submissions' };
  }

  return { success: true, data };
}

module.exports = {
  createSubmission,
  getSubmissionsByRound
};
