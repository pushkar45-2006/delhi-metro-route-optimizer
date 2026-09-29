// MinHeap.js
//
// A simple binary Min-Heap, built from scratch using a plain array.
//
// WHAT THIS HEAP STORES:
// Each item in the heap looks like:
//   { stationId: "SOMEID", distance: 10 }
//
// WHY WE NEED "SMALLEST DISTANCE" FIRST:
// Dijkstra's algorithm always wants to process the station that is
// CURRENTLY closest to the source next. Instead of scanning through
// every unvisited station every single time to find the smallest one
// (which is slow), a Min-Heap keeps the smallest item easily
// accessible at the top (index 0) at all times.
//
// HOW A BINARY HEAP IS STORED IN AN ARRAY:
// For any item at index i:
//   - its left child is at index  2*i + 1
//   - its right child is at index 2*i + 2
//   - its parent is at index      Math.floor((i - 1) / 2)
//
// This class only implements what Dijkstra actually needs:
// insert(), extractMin(), and isEmpty().

class MinHeap {
  constructor() {
    // The heap is stored as a normal array.
    // items[0] will always be the smallest distance in the heap.
    this.items = [];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  // Adds a new item to the heap and moves it up to the correct position.
  insert(item) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  // Removes and returns the item with the smallest distance.
  extractMin() {
    if (this.isEmpty()) {
      throw new Error('Cannot extractMin() from an empty heap');
    }

    const min = this.items[0];
    const last = this.items.pop();

    // If there are still items left, move the last item to the top
    // and then let it sink down to its correct position.
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  // WHAT bubbleUp DOES:
  // When we insert a new item at the end of the array, it might be
  // smaller than its parent. bubbleUp() repeatedly swaps the item
  // with its parent until the parent is smaller (or we reach the top).
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      // If the parent is already smaller or equal, the heap property
      // is satisfied and we can stop.
      if (this.items[parentIndex].distance <= this.items[index].distance) {
        break;
      }

      // Otherwise, swap the item with its parent and keep going up.
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  // WHAT bubbleDown DOES:
  // After removing the smallest item (the root), we move the last
  // item in the array to the root position. It is probably too big
  // to be at the top, so bubbleDown() repeatedly swaps it with its
  // smallest child until it settles into the correct position.
  bubbleDown(index) {
    const length = this.items.length;

    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let smallestIndex = index;

      // Check if the left child exists and is smaller than the current smallest.
      if (leftIndex < length && this.items[leftIndex].distance < this.items[smallestIndex].distance) {
        smallestIndex = leftIndex;
      }

      // Check if the right child exists and is smaller than the current smallest.
      if (rightIndex < length && this.items[rightIndex].distance < this.items[smallestIndex].distance) {
        smallestIndex = rightIndex;
      }

      // If neither child is smaller, the item is in the correct place. Stop.
      if (smallestIndex === index) {
        break;
      }

      // Otherwise, swap with the smaller child and keep sinking down.
      this.swap(index, smallestIndex);
      index = smallestIndex;
    }
  }

  // Small helper to swap two items in the array.
  swap(i, j) {
    const temp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = temp;
  }
}

module.exports = MinHeap;