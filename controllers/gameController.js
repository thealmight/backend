const supabase = require('../db');
const getSupabaseProfile = require('../services/getSupabaseProfile');
const { updatePlayerRound } = require('../services/updatePlayerRound');
const initializeGameData = require('../services/gameDataInitializer');

const COUNTRIES = ['USA', 'China', 'Germany', 'Japan', 'India'];
const PRODUCTS = ['Steel', 'Grain', 'Oil', 'Electronics', 'Textiles'];

// 🎮 Create a new game
exports.createGame = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });
    if (profile.role !== 'operator')
      return res.status(403).json({ error: 'Only the operator can create games.' });

    const { totalRounds = 5 } = req.body;
    const { data: game, error } = await supabase
      .from('games')
      .insert([{ total_rounds: totalRounds, operator_id: profile.id, status: 'waiting' }])
      .select()
      .single();

    if (error || !game) throw error;

    const initSuccess = await initializeGameData(game.id, COUNTRIES, 1);
    if (!initSuccess) return res.status(500).json({ error: 'Failed to initialize game data' });

    res.json({
      success: true,
      game: {
        id: game.id,
        totalRounds: game.total_rounds,
        currentRound: game.current_round,
        status: game.status
      }
    });
  } catch (error) {
    console.error('❌ Create game error:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// 🚀 Start the game
exports.startGame = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });

    const { gameId } = req.params;
    const { data: game, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error || !game) return res.status(404).json({ error: 'Game not found' });
    if (game.operator_id !== profile.id)
      return res.status(403).json({ error: 'Only the operator can start the game' });

    const { count: onlinePlayers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'player')
      .eq('is_online', true);

    if (onlinePlayers < 5)
      return res.status(400).json({ error: `Need 5 players online, currently have ${onlinePlayers}` });

    await supabase.from('games').update({
      status: 'active',
      current_round: 1,
      started_at: new Date().toISOString()
    }).eq('id', gameId);

    await supabase.from('game_rounds').insert([{
      game_id: gameId,
      round_number: 1,
      start_time: new Date().toISOString(),
      status: 'active'
    }]);

    res.json({
      success: true,
      message: 'Game started successfully',
      game: { id: game.id, currentRound: 1, status: 'active' }
    });
  } catch (error) {
    console.error('❌ Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};

// 🔁 Start next round
exports.startNextRound = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });

    const { gameId } = req.params;
    const { data: game, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error || !game) return res.status(404).json({ error: 'Game not found' });
    if (game.operator_id !== profile.id)
      return res.status(403).json({ error: 'Only the operator can control rounds' });

    if (game.current_round >= game.total_rounds)
      return res.status(400).json({ error: 'Game has already ended' });

    await supabase.from('game_rounds').update({
      status: 'completed',
      end_time: new Date().toISOString()
    }).eq('game_id', gameId).eq('round_number', game.current_round);

    const nextRound = game.current_round + 1;

    await supabase.from('games').update({ current_round: nextRound }).eq('id', gameId);

    await supabase.from('game_rounds').insert([{
      game_id: gameId,
      round_number: nextRound,
      start_time: new Date().toISOString(),
      status: 'active'
    }]);

    const initSuccess = await initializeGameData(gameId, COUNTRIES, nextRound);
    if (!initSuccess) return res.status(500).json({ error: 'Failed to initialize next round data' });

    res.json({
      success: true,
      message: `Round ${nextRound} started`,
      currentRound: nextRound
    });
  } catch (error) {
    console.error('❌ Start next round error:', error);
    res.status(500).json({ error: 'Failed to start next round' });
  }
};

// 🛑 End the game
exports.endGame = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });

    const { gameId } = req.params;
    const { data: game, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error || !game) return res.status(404).json({ error: 'Game not found' });
    if (game.operator_id !== profile.id)
      return res.status(403).json({ error: 'Only the operator can end the game' });

    await supabase.from('game_rounds').update({
      status: 'completed',
      end_time: new Date().toISOString()
    }).eq('game_id', gameId).eq('status', 'active');

    await supabase.from('games').update({
      status: 'ended',
      ended_at: new Date().toISOString()
    }).eq('id', gameId);

    res.json({ success: true, message: 'Game ended successfully' });
  } catch (error) {
    console.error('❌ End game error:', error);
    res.status(500).json({ error: 'Failed to end game' });
  }
};

// 📊 Get full game data
exports.getGameData = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });

    const { gameId } = req.params;
    const { data: game, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error || !game) return res.status(404).json({ error: 'Game not found' });

    const { data: production } = await supabase.from('production').select('*').eq('game_id', gameId);
    const { data: demand } = await supabase.from('demand').select('*').eq('game_id', gameId);
    const { data: tariffRates } = await supabase.from('tariff_rates').select('*').eq('game_id', gameId);
    const { data: rounds } = await supabase.from('game_rounds').select('*').eq('game_id', gameId);

    res.json({
      game: {
        id: game.id,
        totalRounds: game.total_rounds,
        currentRound: game.current_round,
        status: game.status,
        production,
        demand,
        tariffRates,
        rounds
      }
    });
  } catch (error) {
    console.error('❌ Get game data error:', error);
    res.status(500).json({ error: 'Failed to get game data' });
  }
};

// 🧑‍🌾 Get player-specific game data
exports.getPlayerGameData = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });

    const playerCountry = profile.country;
    if (!playerCountry) return res.status(400).json({ error: 'Player country not assigned' });

    const { gameId } = req.params;
    const currentRound = parseInt(req.query.currentRound, 10) || 0;

    const { data: production } = await supabase
      .from('production')
      .select('*')
      .eq('game_id', gameId)
      .eq('country', playerCountry);

        const { data: demand } = await supabase
      .from('demand')
      .select('*')
      .eq('game_id', gameId)
      .eq('country', playerCountry);

    const demandedProducts = (demand || []).map(d => d.product).filter(Boolean);

    let tariffRates = [];
    if (demandedProducts.length) {
      const { data: tariffs } = await supabase
        .from('tariff_rates')
        .select('*')
        .eq('game_id', gameId)
        .in('product', demandedProducts)
        .lte('round_number', currentRound)
        .order('round_number', { ascending: true });

      tariffRates = tariffs || [];
    }

    res.json({
      success: true,
      country: playerCountry,
      production,
      demand,
      tariffRates
    });
  } catch (error) {
    console.error('❌ Get player game data error:', error);
    res.status(500).json({ error: 'Failed to get player game data' });
  }
};
exports.resetGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Optional: validate operator access
    const profile = await getSupabaseProfile(req);
    if (!profile || profile.role !== 'operator') {
      return res.status(403).json({ error: 'Only the operator can reset the game.' });
    }

    // Reset game status and round
    const { error: updateError } = await supabase
      .from('games')
      .update({ status: 'waiting', current_round: 1 })
      .eq('id', gameId);

    if (updateError) throw updateError;

    // Optional: reinitialize game data
    const initSuccess = await initializeGameData(gameId, COUNTRIES, 1);
    if (!initSuccess) return res.status(500).json({ error: 'Failed to reinitialize game data' });

    res.json({ success: true, message: 'Game reset successfully' });
  } catch (error) {
    console.error('❌ Reset game error:', error);
    res.status(500).json({ error: 'Failed to reset game' });
  }
};
