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
    const { gameId, userId, country, tariffs } = req.body;

    if (!gameId || !userId || !country || !tariffs) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await Submission.createSubmission({ gameId, userId, country, tariffs });
    
    if (result.success) {
      res.status(201).json({ message: 'Submission saved', data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('❌ Error saving submission:', err.message);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// GET all submissions (with optional query filtering)
router.get('/', async (req, res) => {
  const { gameId, roundNumber } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId is required' });
  }

  try {
    const result = await Submission.getSubmissionsByRound({ gameId, roundNumber });
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('❌ Error fetching submissions:', err.message);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
