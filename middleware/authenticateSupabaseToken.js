// middleware/authenticateSupabaseToken.js

const supabase = require('../db');

async function authenticateSupabaseToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ error: 'Invalid or expired token' });

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  if (!profile) return res.status(403).json({ error: 'User not found in DB' });

  req.user = profile;
  next();
}

module.exports = authenticateSupabaseToken;
