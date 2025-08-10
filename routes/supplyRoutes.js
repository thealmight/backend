// routes/supplyRoutes.js
const express = require('express');
const router = express.Router();

// Optional: Import your Sequelize model
// const SupplyPool = require('../models/SupplyPool');

//
// 🚚 Supply Routes
//

// GET all supply pools (placeholder)
router.get('/', async (req, res) => {
  try {
    // const supplies = await SupplyPool.findAll();
    res.json({ message: 'Supply route is active!' });
  } catch (err) {
    console.error('❌ Error fetching supplies:', err.message);
    res.status(500).json({ error: 'Failed to fetch supply data' });
  }
});

// POST to create new supply data
router.post('/', async (req, res) => {
  const newSupply = req.body;

  try {
    // const created = await SupplyPool.create(newSupply);
    res.status(201).json({ message: 'Supply data created', data: newSupply });
  } catch (err) {
    console.error('❌ Error creating supply:', err.message);
    res.status(500).json({ error: 'Failed to create supply data' });
  }
});

// GET specific supply entry by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // const supply = await SupplyPool.findByPk(id);
    res.json({ message: `Supply entry for ID ${id}` });
  } catch (err) {
    console.error('❌ Error fetching supply by ID:', err.message);
    res.status(500).json({ error: 'Failed to fetch supply entry' });
  }
});

module.exports = router;
