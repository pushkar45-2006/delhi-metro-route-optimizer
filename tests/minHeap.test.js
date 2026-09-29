// minHeap.test.js
//
// Tests for our custom MinHeap. The main thing we care about is that
// extractMin() ALWAYS returns the smallest distance currently in the heap,
// no matter what order items were inserted in.

const MinHeap = require('../src/graph/MinHeap');

describe('MinHeap', () => {
  test('a new heap is empty', () => {
    const heap = new MinHeap();
    expect(heap.isEmpty()).toBe(true);
  });

  test('extractMin() returns the smallest distance first', () => {
    const heap = new MinHeap();

    heap.insert({ stationId: 'B', distance: 5 });
    heap.insert({ stationId: 'A', distance: 1 });
    heap.insert({ stationId: 'C', distance: 10 });

    const first = heap.extractMin();
    expect(first.stationId).toBe('A');
    expect(first.distance).toBe(1);
  });

  test('extractMin() keeps returning items in ascending distance order', () => {
    const heap = new MinHeap();

    const values = [7, 2, 9, 1, 5, 3];
    values.forEach((distance, index) => {
      heap.insert({ stationId: `S${index}`, distance });
    });

    const extractedDistances = [];
    while (!heap.isEmpty()) {
      extractedDistances.push(heap.extractMin().distance);
    }

    expect(extractedDistances).toEqual([1, 2, 3, 5, 7, 9]);
  });

  test('heap becomes empty after removing all items', () => {
    const heap = new MinHeap();
    heap.insert({ stationId: 'A', distance: 1 });
    heap.extractMin();

    expect(heap.isEmpty()).toBe(true);
  });

  test('extractMin() on an empty heap throws an error', () => {
    const heap = new MinHeap();
    expect(() => heap.extractMin()).toThrow();
  });
});