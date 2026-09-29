// routeController.js
//
// A "controller" sits between the HTTP layer (Express routes) and the
// business logic (routeService). Its job is ONLY:
//   1. Read input out of the HTTP request (req.query, req.body, etc.)
//   2. Validate that input.
//   3. Call the correct service function.
//   4. Send back an HTTP response (status code + JSON).
//
// The controller does NOT know how Dijkstra works, and does NOT touch
// the Graph or MinHeap directly. That logic already lives in
// routeService.js / dijkstra.js from Part 2. This keeps HTTP concerns
// (status codes, req/res) completely separate from routing logic.

const { findRoute, resolveStationId, graph } = require('../services/routeService');
const { calculateFare } = require('../services/fareService');
const { saveSearch } = require('../services/historyService');

// The only two weight types our routing engine currently supports.
const ALLOWED_MODES = ['distance', 'time'];

// Handles: GET /api/route?from=...&to=...&mode=...
//
// Note this is now an `async` function, because we `await` the MongoDB
// save before sending the response. Express 5 automatically catches any
// error thrown inside an async route handler and forwards it to our
// errorHandler middleware, so we don't need a try/catch just for that.
async function getRoute(req, res) {
  const { from, to, mode } = req.query;

  // ---- STEP 1: validate the raw input ----

  if (!from) {
    return res.status(400).json({ error: 'Query parameter "from" is required.' });
  }

  if (!to) {
    return res.status(400).json({ error: 'Query parameter "to" is required.' });
  }

  // If mode was not given, default to "distance". If it WAS given,
  // it must be one of the two values our engine understands.
  const chosenMode = mode || 'distance';
  if (!ALLOWED_MODES.includes(chosenMode)) {
    return res.status(400).json({
      error: `Invalid mode "${chosenMode}". Allowed values are: ${ALLOWED_MODES.join(', ')}.`
    });
  }

  // ---- STEP 2: turn user-typed names into internal station ids ----
  // This lets the API accept friendly names like "Hauz Khas" instead of
  // forcing the caller to know internal ids like "HAUZKHAS".

  const fromId = resolveStationId(graph, from);
  const toId = resolveStationId(graph, to);

  if (!fromId) {
    return res.status(404).json({ error: `Unknown station: "${from}"` });
  }

  if (!toId) {
    return res.status(404).json({ error: `Unknown station: "${to}"` });
  }

  // ---- STEP 3: call the existing routing engine ----
  // findRoute() internally builds on Dijkstra (Part 2). This controller
  // never touches Dijkstra, MinHeap, or Graph directly.

  const result = findRoute(fromId, toId, chosenMode);

  if (!result.success) {
    // This covers the "unreachable destination" case. With our current
    // fully-connected dataset this should not normally happen, but we
    // still handle it instead of letting the server crash.
    return res.status(400).json({ error: result.error });
  }

  // ---- STEP 4: build the fare, save history, and send the response ----

  const fare = calculateFare(result.totalDistanceKm);
  const stationNames = result.path.map((station) => station.name);

  const responseData = {
    from: stationNames[0],
    to: stationNames[stationNames.length - 1],
    mode: result.mode,
    path: stationNames,
    numberOfStops: result.numberOfStops,
    distanceKm: result.totalDistanceKm,
    estimatedTimeMin: result.totalTravelTimeMin,
    fareInRupees: fare
  };

  // Save this search to MongoDB. saveSearch() catches its own errors
  // internally (see historyService.js), so this can never cause the
  // route calculation itself to fail - Dijkstra's result is already
  // decided by this point, regardless of what happens to the database.
  await saveSearch(responseData);

  res.status(200).json(responseData);
}

module.exports = {
  getRoute
};