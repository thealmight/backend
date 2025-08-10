const express = require('express');
const { authenticateToken, requireOperator, requirePlayer } = require('./authRouter');
const gameController = require('../controllers/gameController');
const tariffController = require('../controllers/tariffController');
const { updatePlayerRoundHandler } = require('../controllers/roundController');

console.log('🔍 typeof updatePlayerRoundHandler:', typeof updatePlayerRoundHandler);
console.log('🔍 updatePlayerRoundHandler:', updatePlayerRoundHandler); // Show full object

const router = express.Router();

//
// 🎮 Game Management Routes (Operator Only)
router.post('/create', authenticateToken, requireOperator, gameController.createGame);
router.post('/:gameId/start', authenticateToken, requireOperator, gameController.startGame);
router.post('/:gameId/next-round', authenticateToken, requireOperator, gameController.startNextRound);
router.post('/:gameId/end', authenticateToken, requireOperator, gameController.endGame);
router.post('/:gameId/reset', authenticateToken, requireOperator, gameController.resetGame);
router.post('/update-round', authenticateToken, updatePlayerRoundHandler);


//
// 📊 Game Data Routes
//
router.get('/:gameId', authenticateToken, gameController.getGameData);
router.get('/:gameId/player-data', authenticateToken, requirePlayer, gameController.getPlayerGameData);

//
// 💰 Tariff Routes
//
router.post('/tariffs/submit', authenticateToken, requirePlayer, tariffController.submitTariffChanges);
router.get('/:gameId/tariffs', authenticateToken, tariffController.getTariffRates);
router.get('/:gameId/tariffs/history', authenticateToken, requireOperator, tariffController.getTariffHistory);
router.get('/:gameId/tariffs/player-status/:roundNumber', authenticateToken, requirePlayer, tariffController.getPlayerTariffStatus);
router.get('/:gameId/tariffs/matrix/:product', authenticateToken, requireOperator, tariffController.getTariffMatrix);

module.exports = router;
