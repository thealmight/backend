// utils/logAudit.js
const supabase = require('../db');

/**
 * Logs an audit event to Supabase
 * @param {string} userId - Supabase user ID
 * @param {string} action - Short label (e.g., 'submitTariff')
 * @param {object} payload - Details of the action
 * @param {string|null} gameId - Optional game context
 */
async function logAudit(userId, action, payload = {}, gameId = null) {
  const { error } = await supabase
    .from('audit_logs')
    .insert([
      {
        user_id: userId,
        action,
        payload,
        game_id: gameId,
      },
    ]);

  if (error) {
    console.error(`[Audit] Failed to log ${action}`, error);
  }
}

module.exports = logAudit;
