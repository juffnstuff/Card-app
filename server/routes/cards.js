const express = require('express');
const { authenticate } = require('../middleware/auth');
const { searchCards } = require('../services/cardCatalog');

const router = express.Router();

router.use(authenticate);

// GET /api/cards/search?category=birthday&tone=Funny
// DECISION: Card search is fully stubbed with mock data. Replace searchCards() with real vendor API calls.
router.get('/search', async (req, res, next) => {
  try {
    const { category, tone } = req.query;
    const cards = await searchCards({ category, tone });
    res.json({ cards });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
