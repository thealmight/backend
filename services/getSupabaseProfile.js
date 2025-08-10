// services/getSupabaseProfile.js
const supabase = require('../db');

module.exports = async function getSupabaseProfile(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  return profile || null;
};
