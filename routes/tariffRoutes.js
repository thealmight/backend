// routes/tariffRoutes.js
const express = require('express');
const router = express.Router();

// Optional: Import your Sequelize or Supabase tariff model
// const Tariff = require('../models/Tariff');

//
// 💸 Tariff Routes
//

// GET all tariffs (placeholder)
router.get('/', async (req, res) => {
  try {
    // const tariffs = await Tariff.findAll();
    res.json({ message: 'Tariff route is active!' });
  } catch (err) {
    console.error('❌ Error fetching tariffs:', err.message);
    res.status(500).json({ error: 'Failed to fetch tariffs' });
  }
});

// POST a new tariff
router.post('/', async (req, res) => {
  const newTariff = req.body;

  try {
    // const created = await Tariff.create(newTariff);
    res.status(201).json({ message: 'Tariff created', data: newTariff });
  } catch (err) {
    console.error('❌ Error creating tariff:', err.message);
    res.status(500).json({ error: 'Failed to create tariff' });
  }
});

// DELETE a tariff by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // await Tariff.destroy({ where: { id } });
    res.json({ message: `Tariff with ID ${id} deleted` });
  } catch (err) {
    console.error('❌ Error deleting tariff:', err.message);
    res.status(500).json({ error: 'Failed to delete tariff' });
  }
});

module.exports = router;
