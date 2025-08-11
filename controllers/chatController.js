const supabase = require('../db');

/**
 * Inserts a new chat message into the database.
 * @param {Object} params
 * @param {string} params.gameId
 * @param {string} params.senderId
 * @param {string} params.senderCountry
 * @param {string} params.content
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function sendMessage({ gameId, senderId, senderCountry, content }) {
  if (!gameId || !senderId || !content) {
    return { success: false, error: 'Missing required fields' };
  }

  const chatEntry = {
    game_id: gameId,
    sender_id: senderId,
    sender_country: senderCountry,
    message_type: 'text',
    content,
    timestamp: new Date().toISOString()
  };

  const { data, error } = await supabase.from('chat_messages').insert([chatEntry]).select().single();

  if (error) {
    console.error('❌ sendMessage error:', error.message);
    return { success: false, error: 'Failed to send message' };
  }

  return { success: true, data };
}

/**
 * Retrieves chat history for a given game.
 * @param {string} gameId
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
async function getChatHistory(gameId) {
  if (!gameId) {
    return { success: false, error: 'Missing gameId' };
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('game_id', gameId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('❌ getChatHistory error:', error.message);
    return { success: false, error: 'Failed to fetch chat history' };
  }

  return { success: true, data };
}

module.exports = {
  sendMessage,
  getChatHistory
};
