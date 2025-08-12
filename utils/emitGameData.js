const supabase = require('../db');
const gameDataStore = require('../stores/gameDataStore');
const { logAudit } = require('./logAudit'); // Optional: audit logging

/**
 * Emit current game data (production, demand, tariff rates) to all clients in the game room.
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {string} gameId - Game ID (UUID)
 */
async function emitGameData(io, gameId) {
  try {
    // Try to get data from in-memory store first
    const gameData = gameDataStore.getGameData(gameId);
    
    if (gameData) {
      // Emit from memory
      const payload = {
        gameId,
        production: gameData.production,
        demand: gameData.demand,
        tariffRates: gameData.tariffRates,
        currentRound: gameData.currentRound,
        status: gameData.status
      };
      
      io.to(`game_${gameId}`).emit('gameDataUpdated', payload);
    } else {
      // Fallback to DB if not in memory
      const [prodRes, demRes, tariffRes] = await Promise.all([
        supabase.from('production').select('*').eq('game_id', gameId),
        supabase.from('demand').select('*').eq('game_id', gameId),
        supabase.from('tariff_rates').select('*').eq('game_id', gameId)
      ]);
      
      if (prodRes.error || demRes.error || tariffRes.error) {
        console.error('❌ Error fetching game data:', prodRes.error || demRes.error || tariffRes.error);
        return;
      }
      
      const payload = {
        gameId,
        production: prodRes.data || [],
        demand: demRes.data || [],
        tariffRates: tariffRes.data || []
      };
      
      io.to(`game_${gameId}`).emit('gameDataUpdated', payload);
      
      // Add to memory for future use
      gameDataStore.initializeGameData(gameId, payload);
    }
    
    // Optional: log audit
    await logAudit('system', 'emit_game_data', { gameId });
    
    console.log(`📡 Emitted game data for game ${gameId}`);
  } catch (err) {
    console.error('❌ emitGameData failed:', err.message);
  }
}

module.exports = emitGameData;
