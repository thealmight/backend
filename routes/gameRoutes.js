const express = require('express');
const { authenticateToken, requireOperator, requirePlayer } = require('../middleware/authMiddleware');
const gameController = require('../controllers/gameController');
const tariffController = require('../controllers/tariffController');
const roundController = require('../controllers/roundController');

const router = express.Router();

//
// 🧪 Debug: Log controller exports
//
console.log('🔍 gameController keys:', Object.keys(gameController));
console.log('🔍 tariffController keys:', Object.keys(tariffController));
console.log('🔍 roundController keys:', Object.keys(roundController));

console.log('🔐 typeof authenticateToken:', typeof authenticateToken);
console.log('🔐 typeof requireOperator:', typeof requireOperator);
console.log('🔐 typeof requirePlayer:', typeof requirePlayer);

//
// 🧪 Debug: Log incoming requests
//
router.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

//
// 🛡️ Safe handler wrapper
//
function safeHandler(handler, name) {
  if (typeof handler !== 'function') {
    console.error(`❌ Route handler "${name}" is not a function`);
    return (req, res) => res.status(500).json({ error: `Handler "${name}" is missing` });
  }
  return handler;
}

//
// 🎮 Game Management Routes (Operator Only)
//
router.post('/create', authenticateToken, requireOperator, safeHandler(gameController.createGame, 'createGame'));
router.post('/:gameId/start', authenticateToken, requireOperator, safeHandler(gameController.startGame, 'startGame'));
router.post('/:gameId/next-round', authenticateToken, requireOperator, safeHandler(gameController.startNextRound, 'startNextRound'));
router.post('/:gameId/end', authenticateToken, requireOperator, safeHandler(gameController.endGame, 'endGame'));
router.post('/:gameId/reset', authenticateToken, requireOperator, safeHandler(gameController.resetGame, 'resetGame'));
router.post('/update-round', authenticateToken, safeHandler(roundController.updatePlayerRoundHandler, 'updatePlayerRoundHandler'));

//
// 📊 Game Data Routes
//
router.get('/:gameId', authenticateToken, safeHandler(gameController.getGameData, 'getGameData'));
router.get('/:gameId/player-data', authenticateToken, requirePlayer, safeHandler(gameController.getPlayerGameData, 'getPlayerGameData'));

//
// 💰 Tariff Routes
//
router.post('/tariffs/submit', authenticateToken, requirePlayer, safeHandler(tariffController.submitTariffChanges, 'submitTariffChanges'));
router.get('/:gameId/tariffs', authenticateToken, safeHandler(tariffController.getTariffRates, 'getTariffRates'));
router.get('/:gameId/tariffs/history', authenticateToken, requireOperator, safeHandler(tariffController.getTariffHistory, 'getTariffHistory'));
router.get('/:gameId/tariffs/player-status/:roundNumber', authenticateToken, requirePlayer, safeHandler(tariffController.getPlayerTariffStatus, 'getPlayerTariffStatus'));
router.get('/:gameId/tariffs/matrix/:product', authenticateToken, requireOperator, safeHandler(tariffController.getTariffMatrix, 'getTariffMatrix'));

//
// 🚦 Debug: Log all initialized routes
//
console.log('🚦 Routes initialized:');
router.stack.forEach((layer) => {
  if (layer.route) {
    const { path, methods } = layer.route;
    console.log(`  ${Object.keys(methods).join(',').toUpperCase()} ${path}`);
  }
});

module.exports = router;
