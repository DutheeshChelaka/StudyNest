/**
 * Graph BFS — Friend Recommendation Engine (Section 5.2)
 *
 * Suggests study partners who share subjects AND are within
 * the user's social network (friends-of-friends).
 * Time: O(V + E) | Space: O(V)
 */

export interface UserNode {
  id: string;
  name: string;
  subjects: string[];
}

export interface Recommendation {
  user: UserNode;
  score: number;
  depth: number;
  commonSubjects: string[];
}

export class FriendGraph {
  // Adjacency list representation
  private adjacencyList: Map<string, Set<string>> = new Map();
  private userMap: Map<string, UserNode> = new Map();

  // Add a user to the graph
  addUser(user: UserNode): void {
    this.userMap.set(user.id, user);
    if (!this.adjacencyList.has(user.id)) {
      this.adjacencyList.set(user.id, new Set());
    }
  }

  // Add a friendship edge (bidirectional)
  addFriendship(userId1: string, userId2: string): void {
    if (!this.adjacencyList.has(userId1)) {
      this.adjacencyList.set(userId1, new Set());
    }
    if (!this.adjacencyList.has(userId2)) {
      this.adjacencyList.set(userId2, new Set());
    }

    this.adjacencyList.get(userId1)!.add(userId2);
    this.adjacencyList.get(userId2)!.add(userId1);
  }

  // Remove a friendship edge
  removeFriendship(userId1: string, userId2: string): void {
    this.adjacencyList.get(userId1)?.delete(userId2);
    this.adjacencyList.get(userId2)?.delete(userId1);
  }

  // Get direct friends of a user
  getFriends(userId: string): string[] {
    return Array.from(this.adjacencyList.get(userId) || []);
  }

  // BFS to find friend recommendations (Section 5.2)
  getRecommendations(
    userId: string,
    maxDepth: number = 2,
    limit: number = 10,
  ): Recommendation[] {
    const sourceUser = this.userMap.get(userId);
    if (!sourceUser) return [];

    const visited: Set<string> = new Set();
    const recommendations: Recommendation[] = [];

    // BFS queue: [userId, currentDepth]
    const queue: [string, number][] = [];

    // Start BFS from the source user
    visited.add(userId);
    queue.push([userId, 0]);

    while (queue.length > 0) {
      const [currentId, currentDepth] = queue.shift()!;

      // Don't go deeper than maxDepth
      if (currentDepth >= maxDepth) continue;

      // Get all friends of current user
      const friends = this.adjacencyList.get(currentId) || new Set();

      for (const friendId of friends) {
        if (visited.has(friendId)) continue;
        visited.add(friendId);

        const friendUser = this.userMap.get(friendId);
        if (!friendUser) continue;

        const nextDepth = currentDepth + 1;

        // Calculate recommendation score (Section 5.2 — Scoring Formula)
        const commonSubjects = sourceUser.subjects.filter(
          (s) => friendUser.subjects.includes(s),
        );

        if (commonSubjects.length > 0) {
          const score = commonSubjects.length * (maxDepth - nextDepth + 1);

          recommendations.push({
            user: friendUser,
            score,
            depth: nextDepth,
            commonSubjects,
          });
        }

        // Continue BFS from this friend
        queue.push([friendId, nextDepth]);
      }
    }

    // Sort by score (highest first) and limit results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get graph stats (useful for debugging)
  getStats(): { users: number; edges: number } {
    let edges = 0;
    for (const friends of this.adjacencyList.values()) {
      edges += friends.size;
    }
    return {
      users: this.userMap.size,
      edges: edges / 2, // Each edge is counted twice (bidirectional)
    };
  }
}