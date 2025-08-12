// routes/authRouter.js

const express = require('express');
const supabase = require('../db');
// const authenticateSupabaseToken = require('../middleware/authenticateSupabaseToken'); // No longer needed
// const requireOperator = require('../middleware/requireOperator'); // No longer needed

const router = express.Router();

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    // Import our new authentication service
    const authService = require('../services/authService');
    
    // Authenticate user with username and password
    const user = await authService.authenticateUser(username, password);
    
    // For simplicity, we'll generate a basic token (in a real app, use JWT)
    const token = Buffer.from(`${user.id}:${username}`).toString('base64');
    
    res.json({
      success: true,
      access_token: token,
      user: user
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Invalid username or password') {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🚪 LOGOUT
router.post('/logout', async (req, res) => {
  try {
    // For our simple auth system, logout is just clearing the token on the client side
    // In a more complex system, we might maintain a blacklist of tokens
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 👤 GET CURRENT USER
router.get('/me', (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Decode token to get user info
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, username] = decoded.split(':');
    
    if (!userId || !username) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real app, you would fetch the user from the database
    // For now, we'll just return basic user info
    res.json({
      id: userId,
      username: username,
      role: username === 'pavan' ? 'operator' : 'player'
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🧑‍🤝‍🧑 LIST ALL PLAYERS
router.get('/players', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Decode token to get user info
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, username] = decoded.split(':');
    
    // Check if user is operator
    if (username !== 'pavan') {
      return res.status(403).json({ error: 'Access denied. Operator only.' });
    }
    
    // Fetch players from database
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
