// Graph.js
//
// A simple weighted, undirected graph implemented using an adjacency list.
// This represents the Delhi Metro network: stations are nodes, and the
// track segments between them are edges.
//
// We use a JavaScript Map instead of a plain object because:
//   - Map keys keep insertion order (nice for debugging).
//   - Map avoids weird bugs with inherited object properties.
//
// The adjacency list is stored as:
//   stations: Map<stationId, { id, name, lines, isInterchange }>
//   adjacencyList: Map<stationId, Array<{ neighborId, distanceKm, travelTimeMin, line }>>

class Graph {
  constructor() {
    // Stores station metadata, keyed by station id.
    this.stations = new Map();

    // Stores the list of neighbors for each station, keyed by station id.
    this.adjacencyList = new Map();
  }

  // Adds a station (a "node") to the graph.
  // stationInfo = { id, name, lines, isInterchange }
  addStation(stationInfo) {
    const { id } = stationInfo;

    if (this.stations.has(id)) {
      // Station already added - do nothing instead of throwing,
      // since dataset loading may call this more than once safely.
      return;
    }

    this.stations.set(id, stationInfo);

    // Every station starts with an empty neighbor list.
    this.adjacencyList.set(id, []);
  }

  // Adds a connection ("edge") between two stations.
  // Since metro trains run both ways on a track, we add the edge
  // in BOTH directions. This makes the graph undirected.
  //
  // edgeInfo = { distanceKm, travelTimeMin, line }
  addConnection(fromId, toId, edgeInfo) {
    if (!this.stations.has(fromId)) {
      throw new Error(`Cannot add connection: station "${fromId}" does not exist`);
    }
    if (!this.stations.has(toId)) {
      throw new Error(`Cannot add connection: station "${toId}" does not exist`);
    }

    const { distanceKm, travelTimeMin, line } = edgeInfo;

    // Edge from -> to
    this.adjacencyList.get(fromId).push({
      neighborId: toId,
      distanceKm,
      travelTimeMin,
      line
    });

    // Edge to -> from (same weight, opposite direction)
    this.adjacencyList.get(toId).push({
      neighborId: fromId,
      distanceKm,
      travelTimeMin,
      line
    });
  }

  // Returns the list of neighbors for a given station.
  // Each neighbor entry looks like:
  //   { neighborId, distanceKm, travelTimeMin, line }
  getNeighbors(stationId) {
    if (!this.adjacencyList.has(stationId)) {
      throw new Error(`Station "${stationId}" does not exist in the graph`);
    }
    return this.adjacencyList.get(stationId);
  }

  // Returns station metadata (name, lines, etc.) for a given id.
  getStation(stationId) {
    return this.stations.get(stationId);
  }

  // Returns true if the station exists in the graph.
  hasStation(stationId) {
    return this.stations.has(stationId);
  }

  // Returns how many stations are currently in the graph.
  // Useful for tests and sanity checks.
  stationCount() {
    return this.stations.size;
  }

  // Returns how many directed edges are stored internally.
  // Since every connection is stored twice (once per direction),
  // the actual number of physical track segments is edgeCount() / 2.
  edgeCount() {
    let total = 0;
    for (const neighbors of this.adjacencyList.values()) {
      total += neighbors.length;
    }
    return total;
  }
}

module.exports = Graph;