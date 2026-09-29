// dijkstra.js
//
// Dijkstra's Shortest Path Algorithm, built using our own Graph class
// and our own MinHeap class (no external libraries).
//
// HOW IT WORKS (high level):
// 1. Start at the source station with distance 0. Every other station
//    starts with distance = Infinity (we don't know how to reach it yet).
// 2. Repeatedly pull the "closest so far" station out of the MinHeap.
// 3. Look at all of its neighbors. For each neighbor, check if going
//    THROUGH the current station gives a SHORTER distance than what
//    we already know. This check is called "relaxation".
// 4. If it's shorter, update the neighbor's distance and remember that
//    we reached it "via" the current station (this is the `previous` map).
// 5. Keep going until the heap is empty. At that point, `distance` holds
//    the shortest distance from the source to every reachable station,
//    and `previous` lets us reconstruct the actual path.

const MinHeap = require('./MinHeap');

// Reads the correct weight (distance or time) off a single edge,
// depending on which mode the caller asked for.
// This is intentionally a plain if/else - no need for anything fancier.
function getEdgeWeight(edge, weightType) {
  if (weightType === 'time') {
    return edge.travelTimeMin;
  }
  // Default to distance if weightType is "distance" or anything else.
  return edge.distanceKm;
}

// Runs Dijkstra's algorithm starting from sourceId.
// Returns { distance, previous } - both are Maps covering every
// station that is reachable from the source.
//
//   distance.get(stationId) -> shortest known distance from source
//   previous.get(stationId) -> the station we arrived from, on the
//                               shortest path (used for path rebuilding)
function runDijkstra(graph, sourceId, weightType) {
  if (!graph.hasStation(sourceId)) {
    throw new Error(`Source station "${sourceId}" does not exist`);
  }

  const distance = new Map();
  const previous = new Map();

  // Step 1: initialize every station's distance to Infinity,
  // except the source, which is 0.
  for (const stationId of graph.stations.keys()) {
    distance.set(stationId, Infinity);
  }
  distance.set(sourceId, 0);

  // Step 2: put the source into the MinHeap to start things off.
  const heap = new MinHeap();
  heap.insert({ stationId: sourceId, distance: 0 });

  // Keeps track of stations we have already finalized, so we don't
  // process the same station more than once.
  const visited = new Set();

  while (!heap.isEmpty()) {
    const current = heap.extractMin();
    const currentId = current.stationId;

    // Skip if we already finalized this station through a shorter path.
    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    const neighbors = graph.getNeighbors(currentId);

    for (const edge of neighbors) {
      const neighborId = edge.neighborId;
      const weight = getEdgeWeight(edge, weightType);

      const currentDistance = distance.get(currentId);
      const candidateDistance = currentDistance + weight;

      // RELAXATION STEP:
      // If going through the current station gives a shorter path
      // to this neighbor than what we already know, update it.
      if (candidateDistance < distance.get(neighborId)) {
        distance.set(neighborId, candidateDistance);
        previous.set(neighborId, currentId);

        // Push the improved distance into the heap so it gets
        // processed with correct priority later.
        heap.insert({ stationId: neighborId, distance: candidateDistance });
      }
    }
  }

  return { distance, previous };
}

// Walks the `previous` map backwards from destinationId to sourceId,
// then reverses the result to get the path in the correct order
// (source -> ... -> destination).
//
// Returns null if there is no path to the destination.
function reconstructPath(previous, sourceId, destinationId) {
  // If source and destination are the same station, the path is trivial.
  if (sourceId === destinationId) {
    return [sourceId];
  }

  // If Dijkstra never recorded how we reached the destination,
  // it means the destination is unreachable.
  if (!previous.has(destinationId)) {
    return null;
  }

  const path = [destinationId];
  let currentId = destinationId;

  while (currentId !== sourceId) {
    currentId = previous.get(currentId);
    path.push(currentId);
  }

  // We built the path backwards (destination -> source), so reverse it.
  path.reverse();
  return path;
}

// Combines runDijkstra() + reconstructPath() into one convenient function.
// This is the main function other files (like routeService.js) should call.
//
// weightType: "distance" (default) or "time"
//
// Returns: { path: [stationId, ...], totalWeight: number }
// Throws an Error for invalid input or an unreachable destination.
function findShortestPath(graph, sourceId, destinationId, weightType) {
  if (!graph.hasStation(sourceId)) {
    throw new Error(`Source station "${sourceId}" does not exist`);
  }
  if (!graph.hasStation(destinationId)) {
    throw new Error(`Destination station "${destinationId}" does not exist`);
  }

  // Special case: source and destination are the same station.
  if (sourceId === destinationId) {
    return { path: [sourceId], totalWeight: 0 };
  }

  const { distance, previous } = runDijkstra(graph, sourceId, weightType);

  const totalWeight = distance.get(destinationId);

  // If the distance is still Infinity, Dijkstra never reached it.
  if (totalWeight === Infinity) {
    throw new Error(`Destination "${destinationId}" is unreachable from "${sourceId}"`);
  }

  const path = reconstructPath(previous, sourceId, destinationId);

  return { path, totalWeight };
}

module.exports = {
  runDijkstra,
  reconstructPath,
  findShortestPath
};