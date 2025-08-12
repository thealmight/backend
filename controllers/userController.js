const supabase = require('../db');
const getSupabaseUser = require('../services/getSupabaseUser');

// 👤 Login or create user profile
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

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

    res.status(200).json({
      success: true,
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: profile
    });
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
