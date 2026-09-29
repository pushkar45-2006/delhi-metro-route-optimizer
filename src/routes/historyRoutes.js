const express = require('express');
const { getRecentSearches } = require('../services/historyService');

const router = express.Router();

// GET /api/history
// Returns the most recent route searches.
router.get('/history', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const searches = await getRecentSearches(limit);

    res.json(searches);
  } catch (error) {
    next(error);
  }
});

module.exports = router;