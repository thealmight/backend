// services/getSupabaseUser.js

const supabase = require('../db');

async function getSupabaseUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return user;
}

module.exports = getSupabaseUser;
