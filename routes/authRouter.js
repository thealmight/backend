// routes/authRouter.js

const express = require('express');
const supabase = require('../db');
const authenticateSupabaseToken = require('../middleware/authenticateSupabaseToken');
const requireOperator = require('../middleware/requireOperator');

const router = express.Router();

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    // For demo purposes, we'll use a fixed email based on username
    // This is because Supabase Auth requires email/password authentication
    // In a real application, you would have a proper user management system
    // that might use different authentication methods
    const email = `${username}@example.com`;
    
    // Attempt to sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    // If user doesn't exist, create them
    if (authError) {
      // Try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (signUpError) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Use the signup data
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      authData.user = signInData.user;
      authData.session = signInData.session;
    }

    const userId = authData.user.id;
    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      const role = username === 'pavan' ? 'operator' : 'player';
      const userEmail = authData.user.email;

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, username, email: userEmail, role }])
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
