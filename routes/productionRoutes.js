// routes/productionRoutes.js
const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');

// Optional: Add authentication and role checks
// const { authenticateToken, requireOperator } = require('./auth');

//
// 🏭 Production Routes
//

// Create a new production record (Operator only in production)
router.post(
  '/',
  // authenticateToken, requireOperator,
  productionController.createRecord
);

// Get all production records for a specific round
router.get(
  '/:round',
  productionController.getByRound
);

// Update a production record by ID (Operator only in production)
router.put(
  '/:id',
  // authenticateToken, requireOperator,
  productionController.updateRecord
);

module.exports = router;
