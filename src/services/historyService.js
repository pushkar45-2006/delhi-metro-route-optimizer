// historyService.js
//
// This file contains the ONLY two database operations this project
// needs: saving a search, and reading recent searches.
//
// WHY THIS FILE EXISTS SEPARATELY:
// Just like routeService.js keeps Dijkstra logic separate from Express,
// historyService.js keeps MongoDB logic separate from everything else.
// dijkstra.js and Graph.js never import mongoose, and never will -
// they don't know MongoDB exists. That separation is intentional.

const SearchHistory = require('../models/SearchHistory');

// Saves ONE completed route search into MongoDB.
//
// routeResult is the same object the API sends back to the user, so we
// just pick the fields we care about out of it.
//
// IMPORTANT: this function deliberately does NOT throw an error upward.
// If MongoDB is down, or the save fails for any reason, we log it and
// move on. Saving history is a "nice to have" - the person asking for
// a route should never be blocked or fail just because history-saving
// had a problem.
async function saveSearch(routeResult) {
  try {
    const searchToSave = new SearchHistory({
      from: routeResult.from,
      to: routeResult.to,
      mode: routeResult.mode,
      distance: routeResult.distanceKm,
      estimatedTime: routeResult.estimatedTimeMin
    });

    await searchToSave.save();
  } catch (error) {
    console.error('Could not save search history:', error.message);
  }
}

// Returns the most recent searches, newest first.
//
//   .find()                 -> get every document in the collection
//   .sort({ createdAt: -1 }) -> newest first (-1 means descending)
//   .limit(limitCount)       -> only return this many documents
//
// This DOES throw if it fails (unlike saveSearch), because reading
// history is the entire point of the /api/history endpoint - if it
// fails, the controller needs to know so it can send a proper error.
async function getRecentSearches(limitCount) {
  const actualLimit = limitCount || 10;

  const recentSearches = await SearchHistory.find()
    .sort({ createdAt: -1 })
    .limit(actualLimit);

  return recentSearches;
}

module.exports = {
  saveSearch,
  getRecentSearches
};