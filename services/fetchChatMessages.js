// services/fetchChatMessages.js

const supabase = require('../db');

/**
 * Fetch all chat messages for a specific game, ordered by sent time.
 * @param {string} gameId - The UUID of the game.
 * @returns {Promise<Array>} - Array of chat messages.
 */
async function fetchChatMessages(gameId) {
  if (!gameId) throw new Error('gameId is required to fetch chat messages');

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('game_id', gameId)
    .order('sent_at', { ascending: true });

  if (error) {
    console.error('❌ Chat fetch error:', error.message);
    throw error;
  }

  return data || [];
}

module.exports = fetchChatMessages;
