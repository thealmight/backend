const supabase = require('../db');
const getSupabaseUser = require('../services/getSupabaseUser');

// 👤 Login or create user profile
exports.loginUser = async (req, res) => {
  try {
    const supaUser = await getSupabaseUser(req);
    if (!supaUser) {
      return res.status(401).json({ error: 'Invalid or missing Supabase Auth token.' });
    }

    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', supaUser.id)
      .single();

    if (!profile) {
      const username = supaUser.user_metadata?.username || supaUser.email;
      const role = username === 'pavan' ? 'operator' : 'player';

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([{ id: supaUser.id, username, role }])
        .select()
        .single();

      if (insertError) throw insertError;
      profile = newProfile;
      console.log('✅ User profile created:', profile.username);
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Failed to login or fetch profile' });
  }
};

// 📋 Get all users (operator only)
exports.getAllUsers = async (req, res) => {
  try {
    const supaUser = await getSupabaseUser(req);
    if (!supaUser) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', supaUser.id)
      .single();

    if (!profile || profile.role !== 'operator') {
      return res.status(403).json({ error: 'Access denied. Operator only.' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, country, is_online');

    if (error) throw error;

    res.json(users);
  } catch (err) {
    console.error('❌ Fetch users error:', err.message);
    res.status(500).json({ error: 'Could not fetch users' });
  }
};
