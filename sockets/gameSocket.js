// sockets/gameSocket.js
const countries = ['USA', 'China', 'Germany', 'Japan', 'India'];

const { updatePlayerRound } = require('../services/updatePlayerRound');
const {
  generateProduction,
  generateDemand,
  getTariffRates
} = require('../services/gameDataGenerators');
const { persistTariffUpdate } = require('../services/tariffService'); // Stub this

module.exports = (io) => {
  io.on('connection', async (socket) => {
    const { userId, role, country, gameId, username } = socket.handshake.auth || {};

    if (!userId || !country || !gameId) {
      socket.emit('error', { message: 'Missing authentication details' });
      return socket.disconnect();
    }

    socket.userId = userId;
    socket.role = role || 'player';
    socket.country = country;
    socket.gameId = gameId;
    socket.username = username || 'Unknown';

    // Join country and game rooms
    socket.join(`country_${country}`);
    socket.join(`game_${gameId}`);

    console.log(`🔌 ${username} (${country}) connected to game ${gameId}`);

    //
    // 🔁 Player: Update their round
    //
    socket.on('nextRound', async ({ newRound }) => {
      if (typeof newRound !== 'number' || newRound < 1) {
        return socket.emit('error', { message: 'Invalid round number' });
      }

      const success = await updatePlayerRound(userId, newRound);
      if (success) {
        socket.emit('roundUpdated', { playerId: userId, newRound });
      } else {
        socket.emit('error', { message: 'Failed to update round' });
      }
    });

    //
    // 🚀 Operator: Start next round for all players
    //
    socket.on('startNextRound', async ({ roundNumber }) => {
      if (role !== 'operator') {
        return socket.emit('error', { message: 'Only operators can start rounds' });
      }

      try {
        const production = await generateProduction(gameId, roundNumber);
        const demand = await generateDemand(gameId, roundNumber);
        const tariffRates = await getTariffRates(gameId, roundNumber);

        for (const country of countries) {
          io.to(`country_${country}`).emit('gameDataUpdated', {
            production: production[country],
            demand: demand[country],
            tariffRates: tariffRates[country]
          });
        }

        io.to(`game_${gameId}`).emit('gameStateChanged', {
          gameId,
          currentRound: roundNumber,
          updatedBy: username,
          updatedAt: new Date().toISOString()
        });

        console.log(`✅ Round ${roundNumber} started for game ${gameId}`);
      } catch (err) {
        console.error('❌ Failed to start next round:', err.message);
        socket.emit('error', { message: 'Failed to start next round' });
      }
    });

    //
    // 💬 Simple chat relay
    //
    socket.on('chatMessage', ({ to, content }) => {
      io.to(to).emit('receiveMessage', {
        from: socket.userId,
        content,
        timestamp: new Date().toISOString()
      });
    });

    //
    // 💰 Tariff update (persist + broadcast)
    //
    socket.on('updateTariff', async ({ round, productId, from, to, value }) => {
      try {
        await persistTariffUpdate({ gameId, round, productId, from, to, value });
        io.to(`game_${gameId}`).emit('tariffUpdated', { round, productId, from, to, value });
      } catch (err) {
        console.error('❌ Tariff update failed:', err.message);
        socket.emit('error', { message: 'Failed to update tariff' });
      }
    });

    //
    // 🔌 Handle disconnect
    //
    socket.on('disconnect', () => {
      console.log(`👋 ${username} disconnected from game ${gameId}`);
    });
  });
};
