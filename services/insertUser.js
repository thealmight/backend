// services/insertUser.js

const supabase = require('../db');

/**
 * Insert a user row into the database.
 * @param {Object} params
 * @param {string} params.id - Supabase Auth user ID.
 * @param {string} params.username - Display name or handle.
 * @param {string} params.role - 'operator' or 'player'.
 * @param {string} [params.country] - Optional country assignment.
 * @returns {Promise<Object>} - The inserted user record.
 */
async function insertUser({ id, username, role, country = null }) {
  if (!id || !username || !role) {
    throw new Error('Missing required fields for user insertion');
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ id, username, role, country }])
    .select()
    .single();

  if (error) {
    console.error('❌ User insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertUser;
  