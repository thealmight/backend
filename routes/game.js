// routes/game.js
const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { submitTariffChanges } = require('../services/tariffService');

// Create a new game (operator only)
router.post('/create', authenticate, authorizeRole('operator'), async (req, res) => {
  const { totalRounds = 5 } = req.body;

  try {
    const production = generateProductionData();
    const demand = generateDemandData();

    const { data: game, error } = await supabase
      .from('games')
      .insert([{
        total_rounds: totalRounds,
        status: 'waiting',
        production,
        demand,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ game });
  } catch (err) {
    console.error('Create game error:', err);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Start a game (operator only)
router.post('/:gameId/start', authenticate, authorizeRole('operator'), async (req, res) => {
  const { gameId } = req.params;

  try {
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('is_online', true);

    if (playersError) throw playersError;
    if (!players || players.length < 5) {
      return res.status(400).json({ error: 'Need 5 players online to start the game' });
    }

    const { error } = await supabase
      .from('games')
      .update({ status: 'active', current_round: 1 })
      .eq('id', gameId);

    if (error) throw error;

    res.json({ message: 'Game started', currentRound: 1 });
  } catch (err) {
    console.error('Start game error:', err);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Submit tariff changes (player only)
router.post('/tariffs/submit', authenticate, authorizeRole('player'), async (req, res) => {
  const { gameId, roundNumber, tariffChanges } = req.body;
  const userId = req.user.id;

  try {
    const results = await submitTariffChanges(userId, gameId, roundNumber, tariffChanges);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit tariffs' });
  }
});

// Export router
module.exports = router;

// Placeholder helpers
function generateProductionData() {
  return [];
}

function generateDemandData() {
  return [];
}
