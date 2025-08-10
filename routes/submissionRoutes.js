// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

//
// 📝 Submission Routes
//

// POST a new submission
router.post('/', async (req, res) => {
  try {
    const { round, player, country, tariffs } = req.body;

    if (!round || !player || !country || !tariffs) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await Submission.create({ round, player, country, tariffs });
    res.status(201).json({ message: 'Submission saved' });
  } catch (err) {
    console.error('❌ Error saving submission:', err.message);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// GET all submissions (with optional query filtering)
router.get('/', async (req, res) => {
  const { round, player, country } = req.query;
  const where = {};

  if (round) where.round = round;
  if (player) where.player = player;
  if (country) where.country = country;

  try {
    const submissions = await Submission.findAll({ where });
    res.json(submissions);
  } catch (err) {
    console.error('❌ Error fetching submissions:', err.message);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
