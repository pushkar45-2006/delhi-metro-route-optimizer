// historyController.js
//
// Same job as routeController.js, but for the history feature:
// read the request, call the service, send the response.
// This file has never heard of Dijkstra, Graph, or MinHeap.

const { getRecentSearches } = require('../services/historyService');

// Handles: GET /api/history?limit=10
async function getHistory(req, res) {
  try {
    // req.query.limit arrives as a string (e.g. "5"), so we convert it
    // to a number. If it's missing entirely, default to 10.
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

    const recentSearches = await getRecentSearches(limit);

    res.status(200).json(recentSearches);
  } catch (error) {
    // Unlike saveSearch(), getRecentSearches() DOES throw if it fails
    // (e.g. MongoDB is not connected), so we catch it here and send a
    // clear error response instead of crashing.
    console.error('Error fetching search history:', error.message);
    res.status(500).json({ error: 'Could not fetch search history. Is MongoDB running?' });
  }
}

module.exports = {
  getHistory
};