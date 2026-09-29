// buildGraph.js
//
// Reads the station and connection JSON files from /data and uses them
// to construct an in-memory Graph object.
//
// This keeps the "raw data" (JSON files) separate from the "in-memory
// data structure" (the Graph class). That separation makes it easy to:
//   - swap the data source later (e.g. load from MongoDB instead of JSON)
//   - unit test the Graph class without touching the filesystem
//   - regenerate/expand the dataset without touching graph logic

const fs = require('fs'); // fs = file system 
const path = require('path');
const Graph = require('./Graph');

// Default paths to the dataset files. Can be overridden (useful in tests).
const DEFAULT_STATIONS_PATH = path.join(__dirname, '..', '..', 'data', 'stations.json');
const DEFAULT_CONNECTIONS_PATH = path.join(__dirname, '..', '..', 'data', 'connections.json');

function loadJsonFile(filePath) {
  const rawText = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawText);
}

// Builds and returns a fully populated Graph instance.
//
// stationsPath / connectionsPath let callers point at different files,
// which is useful for tests that use small sample datasets.
function buildGraph(stationsPath = DEFAULT_STATIONS_PATH, connectionsPath = DEFAULT_CONNECTIONS_PATH) {
  const graph = new Graph();

  const stations = loadJsonFile(stationsPath);
  const connections = loadJsonFile(connectionsPath);

  // Step 1: add every station as a node first.
  // (We must do this before adding connections, since addConnection
  // checks that both stations already exist.)
  for (const station of stations) {
    graph.addStation(station);
  }

  // Step 2: add every connection as an edge.
  for (const connection of connections) {
    graph.addConnection(connection.from, connection.to, {
      distanceKm: connection.distanceKm,
      travelTimeMin: connection.travelTimeMin,
      line: connection.line
    });
  }

  return graph;
}

module.exports = buildGraph;