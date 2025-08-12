// routes/tariffRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitTariffChanges,
  getTariffRates,
  getTariffHistory,
  getPlayerTariffStatus,
  getTariffMatrix
} = require('../controllers/tariffController');

//
// 💸 Tariff Routes
//

// Submit tariff changes
router.post('/submit', submitTariffChanges);

// Get tariff rates
router.get('/rates/:gameId', getTariffRates);

// Get tariff history
router.get('/history/:gameId', getTariffHistory);

// Get player tariff submission status
router.get('/status/:gameId/:roundNumber', getPlayerTariffStatus);

// Get tariff matrix
router.get('/matrix/:gameId/:product', getTariffMatrix);

module.exports = router;
