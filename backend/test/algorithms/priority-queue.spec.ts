import { PriorityQueue, RoomScore } from '../../src/algorithms/priority-queue';

describe('PriorityQueue', () => {
  let pq: PriorityQueue;

  beforeEach(() => {
    pq = new PriorityQueue();
  });

  describe('Basic Operations', () => {
    it('should start empty', () => {
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size).toBe(0);
      expect(pq.peek()).toBeNull();
    });

    it('should insert a single item', () => {
      pq.insert(createRoom('room1', 50));
      expect(pq.isEmpty()).toBe(false);
      expect(pq.size).toBe(1);
      expect(pq.peek()?.roomId).toBe('room1');
    });

    it('should extract the highest scored room', () => {
      pq.insert(createRoom('low', 10));
      pq.insert(createRoom('high', 90));
      pq.insert(createRoom('mid', 50));

      const max = pq.extractMax();
      expect(max?.roomId).toBe('high');
      expect(max?.score).toBe(90);
      expect(pq.size).toBe(2);
    });

    it('should return null when extracting from empty queue', () => {
      expect(pq.extractMax()).toBeNull();
    });
  });

  describe('Heap Property', () => {
    it('should always extract in descending order', () => {
      const scores = [30, 10, 80, 50, 20, 70, 40, 60, 90, 100];
      scores.forEach((score, i) => {
        pq.insert(createRoom(`room${i}`, score));
      });

      const extracted: number[] = [];
      while (!pq.isEmpty()) {
        extracted.push(pq.extractMax()!.score);
      }

      // Verify descending order
      for (let i = 1; i < extracted.length; i++) {
        expect(extracted[i - 1]).toBeGreaterThanOrEqual(extracted[i]);
      }
    });

    it('should handle duplicate scores', () => {
      pq.insert(createRoom('a', 50));
      pq.insert(createRoom('b', 50));
      pq.insert(createRoom('c', 50));

      expect(pq.size).toBe(3);
      expect(pq.extractMax()?.score).toBe(50);
      expect(pq.extractMax()?.score).toBe(50);
      expect(pq.extractMax()?.score).toBe(50);
      expect(pq.isEmpty()).toBe(true);
    });

    it('should maintain heap after multiple insert and extract operations', () => {
      pq.insert(createRoom('r1', 40));
      pq.insert(createRoom('r2', 60));
      pq.extractMax(); // removes 60
      pq.insert(createRoom('r3', 80));
      pq.insert(createRoom('r4', 30));
      pq.extractMax(); // removes 80

      expect(pq.peek()?.roomId).toBe('r1');
      expect(pq.peek()?.score).toBe(40);
    });
  });

  describe('buildFromArray', () => {
    it('should build a valid heap from an array', () => {
      const rooms = [
        createRoom('r1', 20),
        createRoom('r2', 80),
        createRoom('r3', 50),
        createRoom('r4', 10),
        createRoom('r5', 90),
      ];

      const built = PriorityQueue.buildFromArray(rooms);
      expect(built.size).toBe(5);
      expect(built.extractMax()?.roomId).toBe('r5');
      expect(built.extractMax()?.score).toBe(80);
    });

    it('should handle empty array', () => {
      const built = PriorityQueue.buildFromArray([]);
      expect(built.isEmpty()).toBe(true);
    });

    it('should handle single element array', () => {
      const built = PriorityQueue.buildFromArray([createRoom('only', 42)]);
      expect(built.size).toBe(1);
      expect(built.peek()?.score).toBe(42);
    });
  });

  describe('Edge Cases', () => {
    it('should handle inserting and extracting one item repeatedly', () => {
      for (let i = 0; i < 10; i++) {
        pq.insert(createRoom(`r${i}`, i * 10));
        expect(pq.extractMax()?.score).toBe(i * 10);
        expect(pq.isEmpty()).toBe(true);
      }
    });

    it('should handle large number of items', () => {
      for (let i = 0; i < 1000; i++) {
        pq.insert(createRoom(`r${i}`, Math.random() * 1000));
      }

      expect(pq.size).toBe(1000);

      let prev = Infinity;
      while (!pq.isEmpty()) {
        const current = pq.extractMax()!.score;
        expect(current).toBeLessThanOrEqual(prev);
        prev = current;
      }
    });
  });
});

// Helper function to create a RoomScore
function createRoom(id: string, score: number): RoomScore {
  return {
    roomId: id,
    score,
    roomName: `Room ${id}`,
    subject: 'Physics',
    currentMembers: 3,
    maxCapacity: 10,
  };
}