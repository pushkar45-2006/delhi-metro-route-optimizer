// routeService.js
//
// This is the "business logic" layer for finding a route.
// It sits between the raw Graph/Dijkstra code and the Express API.
//
// WHY THIS FILE EXISTS:
// The Express controller should NOT know anything about Graphs,
// MinHeaps, or Dijkstra. It should just call findRoute(from, to, mode)
// and get back a clean, ready-to-send object. This keeps HTTP concerns
// (req/res, status codes) completely separate from routing logic.

const buildGraph = require('../graph/buildGraph');
const { findShortestPath } = require('../graph/dijkstra');

// The metro graph is built ONCE when this file is first loaded, and then
// reused for every route request. Rebuilding it from the JSON files on
// every single request would be wasteful, since the network layout
// does not change while the server is running.
const graph = buildGraph();

// Turns the "mode" the caller asked for into the weightType that
// dijkstra.js understands. Plain if/else - no need for anything fancier.
function resolveWeightType(mode) {
  if (mode === 'time') {
    return 'time';
  }
  // Default to distance for "distance", undefined, or anything unexpected.
  return 'distance';
}

// Given a full path of station ids, walks each edge on that path and
// adds up BOTH the total distance and the total travel time.
//
// We do this separately from Dijkstra because Dijkstra only optimizes
// for ONE weight at a time (whichever "mode" was requested), but once
// we know the final path, it's cheap to report both numbers to the user.
function sumPathWeights(graph, path) {
  let totalDistanceKm = 0;
  let totalTravelTimeMin = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const currentId = path[i];
    const nextId = path[i + 1];

    const neighbors = graph.getNeighbors(currentId);
    const edge = neighbors.find((n) => n.neighborId === nextId);

    totalDistanceKm += edge.distanceKm;
    totalTravelTimeMin += edge.travelTimeMin;
  }

  return { totalDistanceKm, totalTravelTimeMin };
}

// Converts a list of station ids into a list of { id, name } objects,
// so the final result is readable instead of just a list of codes.
function attachStationNames(graph, path) {
  return path.map((stationId) => {
    const station = graph.getStation(stationId);
    return {
      id: stationId,
      name: station ? station.name : stationId
    };
  });
}

// Takes whatever text the user typed in (e.g. "Hauz Khas" or "hauz khas"
// or even the raw id "HAUZKHAS") and figures out the real station id.
//
// We check two things, in order:
//   1. Is this already a valid station id? (fast path, exact match)
//   2. Does it match a station's `name` field, ignoring upper/lower case?
//
// Returns the station id if found, or null if nothing matches.
// This is what lets the Express API accept human-friendly station names
// instead of forcing the user to know internal ids like "HAUZKHAS".
function resolveStationId(graph, userInput) {
  if (!userInput) {
    return null;
  }

  // Case 1: maybe the user already passed the exact station id.
  const asUpperCase = userInput.toUpperCase();
  if (graph.hasStation(asUpperCase)) {
    return asUpperCase;
  }

  // Case 2: search every station's name for a case-insensitive match.
  const lowerInput = userInput.toLowerCase();
  for (const station of graph.stations.values()) {
    if (station.name.toLowerCase() === lowerInput) {
      return station.id;
    }
  }

  // No match found.
  return null;
}

// The main function other code should call.
//
//   from: source station id (e.g. "RAJIVCHOWK")
//   to:   destination station id (e.g. "KASHMEREGATE")
//   mode: "distance" (default) or "time"
//
// Returns a plain object. It NEVER throws - any problem is reported
// through { success: false, error: "..." } so calling code (and the
// Express controller) doesn't need try/catch everywhere.
function findRoute(from, to, mode) {
  const weightType = resolveWeightType(mode);

  try {
    const result = findShortestPath(graph, from, to, weightType);
    const { totalDistanceKm, totalTravelTimeMin } = sumPathWeights(graph, result.path);

    return {
      success: true,
      from,
      to,
      mode: weightType,
      path: attachStationNames(graph, result.path),
      numberOfStops: result.path.length - 1,
      totalDistanceKm: Math.round(totalDistanceKm * 100) / 100, // rounded to 2 decimals
      totalTravelTimeMin
    };
  } catch (error) {
    // findShortestPath() throws plain Errors for:
    //   - unknown source station
    //   - unknown destination station
    //   - unreachable destination
    // We catch them here and turn them into a clean result object.
    return {
      success: false,
      from,
      to,
      mode: weightType,
      error: error.message
    };
  }
}

module.exports = {
  findRoute,
  resolveStationId,
  graph // exported mainly so tests/controllers can reuse the same graph instance
};