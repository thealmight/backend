// routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const supabase = require('../db'); // Initialized Supabase client

// GET all unique players from 'submissions' table
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('player')
      .neq('player', null)
      .order('player', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch players' });
    }

    const uniquePlayers = [...new Set(data.map(entry => entry.player))];
    res.json(uniquePlayers);
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

module.exports = router;
