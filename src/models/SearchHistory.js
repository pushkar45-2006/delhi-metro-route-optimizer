// SearchHistory.js
//
// This is a Mongoose "model". A model is just a JavaScript class that
// represents ONE MongoDB collection, and enforces a shape (schema) on
// every document saved into it.
//
// For this project, this is the ONLY collection we use. Every time
// someone successfully searches for a route through the API, we save
// one document here describing that search.
//
// Example document this will produce in MongoDB:
// {
//   from: "Hauz Khas",
//   to: "Rajiv Chowk",
//   mode: "distance",
//   distance: 10,
//   estimatedTime: 21,
//   createdAt: "2026-09-27T10:15:00.000Z"
// }

const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  // The station the search started from (e.g. "Hauz Khas").
  from: {
    type: String,
    required: true
  },

  // The station the search ended at (e.g. "Rajiv Chowk").
  to: {
    type: String,
    required: true
  },

  // Which weight Dijkstra optimized for: "distance" or "time".
  mode: {
    type: String,
    required: true
  },

  // Total distance of the route, in kilometers.
  distance: {
    type: Number,
    required: true
  },

  // Total estimated travel time of the route, in minutes.
  estimatedTime: {
    type: Number,
    required: true
  },

  // When this search happened. `default: Date.now` means Mongoose
  // automatically fills this in with the current time if we don't
  // provide one ourselves.
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// mongoose.model(name, schema) does two things:
//   1. Registers this schema under the name "SearchHistory".
//   2. Tells MongoDB to store its documents in a collection called
//      "searchhistories" (Mongoose automatically lowercases the name
//      and adds an "s" - this is just a naming convention, nothing magic).
module.exports = mongoose.model('SearchHistory', searchHistorySchema);