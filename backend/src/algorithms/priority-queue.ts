/**
 * Max-Heap Priority Queue for Smart Room Matching (Section 5.1)
 *
 * Used by the Quick Join feature to find the best room for a user.
 * Insert: O(log n) | Extract Max: O(log n) | Peek: O(1)
 */

export interface RoomScore {
  roomId: string;
  score: number;
  roomName: string;
  subject: string;
  currentMembers: number;
  maxCapacity: number;
}

export class PriorityQueue {
  private heap: RoomScore[] = [];

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // O(1) — View the highest scored room without removing
  peek(): RoomScore | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // O(log n) — Insert a room with its score
  insert(item: RoomScore): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  // O(log n) — Remove and return the highest scored room
  extractMax(): RoomScore | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);

    return max;
  }

  // O(n) — Build heap from an array of rooms
  static buildFromArray(items: RoomScore[]): PriorityQueue {
    const pq = new PriorityQueue();
    pq.heap = [...items];

    // Start from last non-leaf node and bubble down
    for (let i = Math.floor(pq.heap.length / 2) - 1; i >= 0; i--) {
      pq.bubbleDown(i);
    }

    return pq;
  }

  // Move element up to maintain heap property
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.heap[parentIndex].score >= this.heap[index].score) break;

      // Swap with parent
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  // Move element down to maintain heap property
  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].score > this.heap[largest].score) {
        largest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild].score > this.heap[largest].score) {
        largest = rightChild;
      }

      if (largest === index) break;

      [this.heap[largest], this.heap[index]] = [this.heap[index], this.heap[largest]];
      index = largest;
    }
  }
}