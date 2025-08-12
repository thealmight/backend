// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

//
// 📦 Product Routes
//

// GET all products
router.get('/', async (req, res) => {
  try {
    // Since we don't have a separate products table, we'll return the fixed list
    const products = ['Steel', 'Grain', 'Oil', 'Electronics', 'Textiles'];
    res.json(products.map(name => ({ name })));
  } catch (err) {
    console.error('❌ Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET product usage across all submissions
router.get('/:name/usage', async (req, res) => {
  const { name } = req.params;
  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId is required' });
  }

  try {
    const result = await Submission.getSubmissionsByRound({ gameId });
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const usage = result.data
      .filter(sub => sub.product === name)
      .map(sub => ({
        round: sub.round_number,
        fromCountry: sub.from_country,
        toCountry: sub.to_country,
        rate: sub.rate,
        submittedAt: sub.submitted_at
      }));

    res.json(usage);
  } catch (err) {
    console.error('❌ Error fetching product usage:', err.message);
    res.status(500).json({ error: 'Failed to fetch product usage' });
  }
});

module.exports = router;
