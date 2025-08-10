// routes/gameStats.js
router.get('/stats/:gameId/:round', async (req, res) => {
  const { gameId, round } = req.params;
  const [prod, demand] = await Promise.all([
    supabase.from('production').select('*').eq('game_id', gameId).eq('round_number', round),
    supabase.from('demand').select('*').eq('game_id', gameId).eq('round_number', round)
  ]);
  res.json({ production: prod.data, demand: demand.data });
});
