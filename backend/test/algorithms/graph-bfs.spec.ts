import { FriendGraph, UserNode } from '../../src/algorithms/graph-bfs';

describe('FriendGraph', () => {
  let graph: FriendGraph;

  beforeEach(() => {
    graph = new FriendGraph();
  });

  describe('Graph Construction', () => {
    it('should start empty', () => {
      const stats = graph.getStats();
      expect(stats.users).toBe(0);
      expect(stats.edges).toBe(0);
    });

    it('should add users', () => {
      graph.addUser(createUser('u1', ['Physics']));
      graph.addUser(createUser('u2', ['Chemistry']));

      expect(graph.getStats().users).toBe(2);
    });

    it('should add bidirectional friendships', () => {
      graph.addUser(createUser('u1', ['Physics']));
      graph.addUser(createUser('u2', ['Physics']));
      graph.addFriendship('u1', 'u2');

      expect(graph.getStats().edges).toBe(1);
      expect(graph.getFriends('u1')).toContain('u2');
      expect(graph.getFriends('u2')).toContain('u1');
    });

    it('should remove friendships', () => {
      graph.addUser(createUser('u1', ['Physics']));
      graph.addUser(createUser('u2', ['Physics']));
      graph.addFriendship('u1', 'u2');
      graph.removeFriendship('u1', 'u2');

      expect(graph.getFriends('u1')).not.toContain('u2');
      expect(graph.getFriends('u2')).not.toContain('u1');
    });

    it('should return empty array for user with no friends', () => {
      graph.addUser(createUser('u1', ['Physics']));
      expect(graph.getFriends('u1')).toEqual([]);
    });
  });

  describe('BFS Recommendations', () => {
    it('should recommend direct friends with shared subjects', () => {
      graph.addUser(createUser('me', ['Physics', 'Maths']));
      graph.addUser(createUser('friend1', ['Physics']));
      graph.addUser(createUser('friend2', ['Chemistry']));

      graph.addFriendship('me', 'friend1');
      graph.addFriendship('me', 'friend2');

      const recs = graph.getRecommendations('me');

      // friend1 shares Physics, friend2 shares nothing
      expect(recs.length).toBe(1);
      expect(recs[0].user.id).toBe('friend1');
      expect(recs[0].commonSubjects).toContain('Physics');
    });

    it('should recommend friends-of-friends', () => {
      graph.addUser(createUser('me', ['Physics']));
      graph.addUser(createUser('friend', ['Maths']));
      graph.addUser(createUser('fof', ['Physics', 'Maths']));

      graph.addFriendship('me', 'friend');
      graph.addFriendship('friend', 'fof');

      const recs = graph.getRecommendations('me', 2);

      // fof is depth 2 and shares Physics
      const fofRec = recs.find((r) => r.user.id === 'fof');
      expect(fofRec).toBeDefined();
      expect(fofRec?.depth).toBe(2);
      expect(fofRec?.commonSubjects).toContain('Physics');
    });

    it('should score direct friends higher than friends-of-friends', () => {
      graph.addUser(createUser('me', ['Physics']));
      graph.addUser(createUser('direct', ['Physics']));
      graph.addUser(createUser('bridge', ['Maths']));
      graph.addUser(createUser('fof', ['Physics']));

      graph.addFriendship('me', 'direct');
      graph.addFriendship('me', 'bridge');
      graph.addFriendship('bridge', 'fof');

      const recs = graph.getRecommendations('me', 2);

      const directRec = recs.find((r) => r.user.id === 'direct');
      const fofRec = recs.find((r) => r.user.id === 'fof');

      expect(directRec).toBeDefined();
      expect(fofRec).toBeDefined();
      // Direct friend (depth 1) should score higher than fof (depth 2)
      expect(directRec!.score).toBeGreaterThan(fofRec!.score);
    });

    it('should score users with more common subjects higher', () => {
      graph.addUser(createUser('me', ['Physics', 'Maths', 'Chemistry']));
      graph.addUser(createUser('oneSubject', ['Physics']));
      graph.addUser(createUser('twoSubjects', ['Physics', 'Maths']));

      graph.addFriendship('me', 'oneSubject');
      graph.addFriendship('me', 'twoSubjects');

      const recs = graph.getRecommendations('me');

      expect(recs[0].user.id).toBe('twoSubjects');
      expect(recs[0].commonSubjects.length).toBe(2);
      expect(recs[1].user.id).toBe('oneSubject');
      expect(recs[1].commonSubjects.length).toBe(1);
    });

    it('should not recommend users with no shared subjects', () => {
      graph.addUser(createUser('me', ['Physics']));
      graph.addUser(createUser('friend', ['Art', 'Music']));

      graph.addFriendship('me', 'friend');

      const recs = graph.getRecommendations('me');
      expect(recs.length).toBe(0);
    });

    it('should respect depth limit', () => {
      graph.addUser(createUser('me', ['Physics']));
      graph.addUser(createUser('depth1', ['Maths']));
      graph.addUser(createUser('depth2', ['Maths']));
      graph.addUser(createUser('depth3', ['Physics']));

      graph.addFriendship('me', 'depth1');
      graph.addFriendship('depth1', 'depth2');
      graph.addFriendship('depth2', 'depth3');

      // With maxDepth=2, depth3 should NOT be reached
      const recs = graph.getRecommendations('me', 2);
      const depth3Rec = recs.find((r) => r.user.id === 'depth3');
      expect(depth3Rec).toBeUndefined();
    });

    it('should respect limit parameter', () => {
      graph.addUser(createUser('me', ['Physics']));

      for (let i = 0; i < 20; i++) {
        const friendId = `friend${i}`;
        graph.addUser(createUser(friendId, ['Physics']));
        graph.addFriendship('me', friendId);
      }

      const recs = graph.getRecommendations('me', 2, 5);
      expect(recs.length).toBe(5);
    });

    it('should not recommend yourself', () => {
      graph.addUser(createUser('me', ['Physics']));
      graph.addUser(createUser('friend', ['Physics']));

      graph.addFriendship('me', 'friend');

      const recs = graph.getRecommendations('me');
      const selfRec = recs.find((r) => r.user.id === 'me');
      expect(selfRec).toBeUndefined();
    });

    it('should return empty for non-existent user', () => {
      const recs = graph.getRecommendations('nobody');
      expect(recs).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle disconnected graph', () => {
      graph.addUser(createUser('me', ['Physics']));
      graph.addUser(createUser('isolated', ['Physics']));

      // No friendship between them
      const recs = graph.getRecommendations('me');
      expect(recs.length).toBe(0);
    });

    it('should handle circular friendships', () => {
      graph.addUser(createUser('a', ['Physics']));
      graph.addUser(createUser('b', ['Physics']));
      graph.addUser(createUser('c', ['Physics']));

      graph.addFriendship('a', 'b');
      graph.addFriendship('b', 'c');
      graph.addFriendship('c', 'a');

      // Should not loop infinitely
      const recs = graph.getRecommendations('a');
      expect(recs.length).toBe(2);
    });

    it('should handle user with no friends', () => {
      graph.addUser(createUser('loner', ['Physics']));
      const recs = graph.getRecommendations('loner');
      expect(recs).toEqual([]);
    });

    it('should handle large social network', () => {
      // Create a network of 100 users
      for (let i = 0; i < 100; i++) {
        graph.addUser(createUser(`u${i}`, ['Physics', 'Maths']));
      }

      // Connect them in a chain
      for (let i = 0; i < 99; i++) {
        graph.addFriendship(`u${i}`, `u${i + 1}`);
      }

      const stats = graph.getStats();
      expect(stats.users).toBe(100);
      expect(stats.edges).toBe(99);

      // Should complete quickly and not crash
      const recs = graph.getRecommendations('u50', 2, 10);
      expect(recs.length).toBeLessThanOrEqual(10);
    });
  });
});

// Helper to create a UserNode
function createUser(id: string, subjects: string[]): UserNode {
  return {
    id,
    name: `User ${id}`,
    subjects,
  };
}