// graph.test.js
//
// Basic tests for the Graph data structure and the buildGraph loader.
// Run with: npm test

const Graph = require('../src/graph/Graph');
const buildGraph = require('../src/graph/buildGraph');

describe('Graph - basic structure', () => {
  test('a new graph starts empty', () => {
    const graph = new Graph();
    expect(graph.stationCount()).toBe(0);
    expect(graph.edgeCount()).toBe(0);
  });

  test('addStation() inserts a station', () => {
    const graph = new Graph();
    graph.addStation({ id: 'A', name: 'Station A', lines: ['Red'], isInterchange: false });

    expect(graph.stationCount()).toBe(1);
    expect(graph.hasStation('A')).toBe(true);
    expect(graph.getStation('A').name).toBe('Station A');
  });

  test('addStation() does not duplicate a station added twice', () => {
    const graph = new Graph();
    graph.addStation({ id: 'A', name: 'Station A', lines: ['Red'], isInterchange: false });
    graph.addStation({ id: 'A', name: 'Station A', lines: ['Red'], isInterchange: false });

    expect(graph.stationCount()).toBe(1);
  });

  test('addConnection() creates an edge in both directions', () => {
    const graph = new Graph();
    graph.addStation({ id: 'A', name: 'Station A', lines: ['Red'], isInterchange: false });
    graph.addStation({ id: 'B', name: 'Station B', lines: ['Red'], isInterchange: false });

    graph.addConnection('A', 'B', { distanceKm: 1.5, travelTimeMin: 3, line: 'Red' });

    const neighborsOfA = graph.getNeighbors('A');
    const neighborsOfB = graph.getNeighbors('B');

    expect(neighborsOfA).toHaveLength(1);
    expect(neighborsOfB).toHaveLength(1);
    expect(neighborsOfA[0].neighborId).toBe('B');
    expect(neighborsOfB[0].neighborId).toBe('A');
    expect(neighborsOfA[0].distanceKm).toBe(1.5);
  });

  test('addConnection() throws if a station does not exist', () => {
    const graph = new Graph();
    graph.addStation({ id: 'A', name: 'Station A', lines: ['Red'], isInterchange: false });

    expect(() => {
      graph.addConnection('A', 'MISSING', { distanceKm: 1, travelTimeMin: 1, line: 'Red' });
    }).toThrow();
  });

  test('getNeighbors() throws for an unknown station', () => {
    const graph = new Graph();
    expect(() => graph.getNeighbors('NOT_A_STATION')).toThrow();
  });
});

describe('buildGraph - loading the real Delhi Metro dataset', () => {
  test('loads all stations from data/stations.json', () => {
    const graph = buildGraph();

    // We expect somewhere between 30 and 50 stations, per project spec.
    expect(graph.stationCount()).toBeGreaterThanOrEqual(30);
    expect(graph.stationCount()).toBeLessThanOrEqual(50);
  });

  test('a known interchange station has neighbors on more than one line', () => {
    const graph = buildGraph();

    // Kashmere Gate is a real interchange between Red, Yellow and Violet lines.
    const neighbors = graph.getNeighbors('KASHMEREGATE');
    const linesAtNeighbors = new Set(neighbors.map((n) => n.line));

    expect(linesAtNeighbors.size).toBeGreaterThan(1);
  });

  test('every connection references stations that actually exist', () => {
    const graph = buildGraph();

    for (const stationId of graph.stations.keys()) {
      const neighbors = graph.getNeighbors(stationId);
      for (const neighbor of neighbors) {
        expect(graph.hasStation(neighbor.neighborId)).toBe(true);
      }
    }
  });

  test('the graph is connected (every station reachable from Rajiv Chowk)', () => {
    // A simple breadth-first search to confirm there are no isolated islands
    // in the dataset. This is a good sanity check before we build Dijkstra
    // on top of this graph in a later session.
    const graph = buildGraph();

    const visited = new Set();
    const queue = ['RAJIVCHOWK'];
    visited.add('RAJIVCHOWK');

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.neighborId)) {
          visited.add(neighbor.neighborId);
          queue.push(neighbor.neighborId);
        }
      }
    }

    expect(visited.size).toBe(graph.stationCount());
  });
});