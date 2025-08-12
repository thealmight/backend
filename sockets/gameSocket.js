// sockets/gameSocket.js
const countries = ['USA', 'China', 'Germany', 'Japan', 'India'];
const supabase = require('../db');
const gameDataStore = require('../stores/gameDataStore');

const { updatePlayerRound } = require('../services/updatePlayerRound');

module.exports = function gameSocket(socket, io) {
  // 📨 Handle incoming game data request
  socket.on('getGameData', async ({ gameId }) => {
    if (!gameId) {
      return socket.emit('error', { message: 'Missing gameId' });
    }

    try {
      // Try to get data from in-memory store first
      const gameData = gameDataStore.getGameData(gameId);
      
      if (gameData) {
        // Emit from memory
        socket.emit('gameData', {
          gameId,
          production: gameData.production,
          demand: gameData.demand,
          tariffRates: gameData.tariffRates,
          currentRound: gameData.currentRound,
          status: gameData.status
        });
      } else {
        // Fallback to DB if not in memory
        const { data: production } = await supabase.from('production').select('*').eq('game_id', gameId);
        const { data: demand } = await supabase.from('demand').select('*').eq('game_id', gameId);
        const { data: tariffRates } = await supabase.from('tariff_rates').select('*').eq('game_id', gameId);
        
        const payload = {
          gameId,
          production: production || [],
          demand: demand || [],
          tariffRates: tariffRates || [],
          currentRound: 1,
          status: 'waiting'
        };
        
        socket.emit('gameData', payload);
        
        // Add to memory for future use
        gameDataStore.initializeGameData(gameId, payload);
      }
    } catch (error) {
      console.error('❌ Get game data error:', error.message);
      socket.emit('error', { message: 'Failed to fetch game data' });
    }
  });

  // 🔁 Player: Update their round
  socket.on('nextRound', async ({ newRound }) => {
    if (typeof newRound !== 'number' || newRound < 1) {
      return socket.emit('error', { message: 'Invalid round number' });
    }

    try {
      const result = await updatePlayerRound(socket.userId, newRound);
      if (result) {
        socket.emit('roundUpdated', { playerId: socket.userId, newRound });
      } else {
        socket.emit('error', { message: 'Failed to update round' });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to update round', error: error.message });
    }
  });

  // 🚀 Operator: Start next round for all players
  socket.on('startNextRound', async ({ roundNumber }) => {
    if (socket.role !== 'operator') {
      return socket.emit('error', { message: 'Only operators can start rounds' });
    }

    try {
      // Update game state in database
      await supabase
        .from('games')
        .update({ current_round: roundNumber })
        .eq('id', socket.gameId);
      
      // Update in-memory store
      gameDataStore.updateGameRound(socket.gameId, roundNumber);
      
      // Emit game state update immediately
      io.to(`game_${socket.gameId}`).emit('gameStateChanged', {
        gameId: socket.gameId,
        currentRound: roundNumber,
        updatedBy: socket.username,
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ Round ${roundNumber} started for game ${socket.gameId}`);
    } catch (err) {
      console.error('❌ Failed to start next round:', err.message);
      socket.emit('error', { message: 'Failed to start next round' });
    }
  });

  // 💬 Simple chat relay
  socket.on('chatMessage', ({ to, content }) => {
    io.to(to).emit('receiveMessage', {
      from: socket.userId,
      content,
      timestamp: new Date().toISOString()
    });
  });

  // 💰 Tariff update (persist + broadcast)
  socket.on('updateTariff', async ({ round, productId, from, to, value }) => {
    try {
      // Persist to database
      const { error } = await supabase
        .from('tariff_rates')
        .upsert({
          game_id: socket.gameId,
          round_number: round,
          product: productId,
          from_country: from,
          to_country: to,
          rate: value,
          updated_by: socket.userId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: ['game_id', 'round_number', 'product', 'from_country', 'to_country']
        });
      
      if (error) {
        console.error('❌ Tariff update error:', error.message);
        return socket.emit('error', { message: 'Failed to update tariff' });
      }
      
      // Update in-memory store
      const { data: updatedTariffRates } = await supabase
        .from('tariff_rates')
        .select('*')
        .eq('game_id', socket.gameId);
      gameDataStore.updateTariffRates(socket.gameId, updatedTariffRates || []);
      
      // Broadcast immediately
      io.to(`game_${socket.gameId}`).emit('tariffUpdated', { 
        round, 
        productId, 
        from, 
        to, 
        value,
        updatedBy: socket.username,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('❌ Tariff update failed:', err.message);
      socket.emit('error', { message: 'Failed to update tariff' });
    }
  });

  // 🔌 Handle disconnect
  socket.on('disconnect', () => {
    console.log(`👋 ${socket.username} disconnected from game ${socket.gameId}`);
  });
};
