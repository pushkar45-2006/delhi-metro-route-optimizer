// dijkstra.test.js
//
// Tests for Dijkstra's algorithm and path reconstruction.
// We use two kinds of graphs here:
//   1. A small, hand-built graph where we know the correct answer by hand.
//      This is the best way to prove the algorithm itself is correct.
//   2. The real Delhi Metro dataset, to prove it works on real data too.

const Graph = require('../src/graph/Graph');
const buildGraph = require('../src/graph/buildGraph');
const { findShortestPath } = require('../src/graph/dijkstra');

// Builds a small test graph shaped like this:
//
//   A --1--> B --1--> D
//   |                 ^
//   4-----------------|
//
// So there are two ways from A to D:
//   A -> B -> D  (distance 1 + 1 = 2)   <-- shorter
//   A -> D directly (distance 4)         <-- longer
//
// A correct Dijkstra implementation MUST pick the A -> B -> D path.
function buildSmallTestGraph() {
  const graph = new Graph();

  graph.addStation({ id: 'A', name: 'A', lines: ['Test'], isInterchange: false });
  graph.addStation({ id: 'B', name: 'B', lines: ['Test'], isInterchange: false });
  graph.addStation({ id: 'D', name: 'D', lines: ['Test'], isInterchange: false });

  graph.addConnection('A', 'B', { distanceKm: 1, travelTimeMin: 5, line: 'Test' });
  graph.addConnection('B', 'D', { distanceKm: 1, travelTimeMin: 5, line: 'Test' });
  graph.addConnection('A', 'D', { distanceKm: 4, travelTimeMin: 1, line: 'Test' });

  return graph;
}

describe('findShortestPath - small hand-built graph', () => {
  test('chooses the shorter multi-hop path over the longer direct path (distance mode)', () => {
    const graph = buildSmallTestGraph();
    const result = findShortestPath(graph, 'A', 'D', 'distance');

    expect(result.path).toEqual(['A', 'B', 'D']);
    expect(result.totalWeight).toBe(2);
  });

  test('time mode picks the direct edge, since it is faster despite being longer in distance', () => {
    const graph = buildSmallTestGraph();
    const result = findShortestPath(graph, 'A', 'D', 'time');

    // A -> D directly takes 1 minute.
    // A -> B -> D takes 5 + 5 = 10 minutes.
    expect(result.path).toEqual(['A', 'D']);
    expect(result.totalWeight).toBe(1);
  });

  test('source equal to destination returns a single-station path with 0 weight', () => {
    const graph = buildSmallTestGraph();
    const result = findShortestPath(graph, 'A', 'A', 'distance');

    expect(result.path).toEqual(['A']);
    expect(result.totalWeight).toBe(0);
  });

  test('throws a clear error for an unknown source station', () => {
    const graph = buildSmallTestGraph();
    expect(() => findShortestPath(graph, 'NOT_REAL', 'D', 'distance')).toThrow();
  });

  test('throws a clear error for an unknown destination station', () => {
    const graph = buildSmallTestGraph();
    expect(() => findShortestPath(graph, 'A', 'NOT_REAL', 'distance')).toThrow();
  });

  test('throws a clear error when the destination is unreachable', () => {
    const graph = new Graph();
    graph.addStation({ id: 'X', name: 'X', lines: ['Test'], isInterchange: false });
    graph.addStation({ id: 'Y', name: 'Y', lines: ['Test'], isInterchange: false });
    // No connection added between X and Y - Y is an isolated island.

    expect(() => findShortestPath(graph, 'X', 'Y', 'distance')).toThrow();
  });
});

describe('findShortestPath - real Delhi Metro dataset', () => {
  test('finds the direct Yellow Line path from Rajiv Chowk to Kashmere Gate', () => {
    const graph = buildGraph();
    const result = findShortestPath(graph, 'RAJIVCHOWK', 'KASHMEREGATE', 'distance');

    // The direct Yellow Line route is:
    // KASHMEREGATE - CHANDNICHOWK - CHAWRIBAZAR - NEWDELHI - RAJIVCHOWK
    expect(result.path).toEqual([
      'RAJIVCHOWK',
      'NEWDELHI',
      'CHAWRIBAZAR',
      'CHANDNICHOWK',
      'KASHMEREGATE'
    ]);

    // 1.0 + 1.3 + 0.9 + 1.1 = 4.3 km
    expect(result.totalWeight).toBeCloseTo(4.3, 5);
  });

  test('finds the same route using time mode', () => {
    const graph = buildGraph();
    const result = findShortestPath(graph, 'RAJIVCHOWK', 'KASHMEREGATE', 'time');

    // 2 + 3 + 2 + 2 = 9 minutes
    expect(result.totalWeight).toBe(9);
  });
});