// routes/authRouter.js

const express = require('express');
const supabase = require('../db');
const authenticateSupabaseToken = require('../middleware/authenticateSupabaseToken');
const requireOperator = require('../middleware/requireOperator');

const router = express.Router();

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return res.status(401).json({ error: 'Invalid email or password' });

    const userId = authData.user.id;
    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      const username = authData.user.user_metadata?.username || authData.user.email;
      const role = username === 'pavan' ? 'operator' : 'player';

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, username, email, role }])
        .select()
        .single();
      if (insertError) throw insertError;
      profile = newProfile;
    }

    res.json({
      success: true,
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: profile
    });
  } catch (error) {
    console.error('Supabase login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🚪 LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    await supabase.auth.signOut();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 👤 GET CURRENT USER
router.get('/me', authenticateSupabaseToken, (req, res) => {
  res.json(req.user);
});

// 🧑‍🤝‍🧑 LIST ALL PLAYERS
router.get('/players', authenticateSupabaseToken, requireOperator, async (req, res) => {
  try {
    const { data: players, error } = await supabase
      .from('users')
      .select('id, username, email, country, is_online')
      .eq('role', 'player')
      .order('username', { ascending: true });
    if (error) throw error;
    res.json(players);
  } catch (error) {
    console.error('Fetch players error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


