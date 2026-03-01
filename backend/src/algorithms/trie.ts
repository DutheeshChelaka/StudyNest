/**
 * Trie for Search Autocomplete (Section 5.3)
 *
 * Provides sub-millisecond prefix matching for room names and usernames.
 * Insert: O(m) | Search: O(m) | Autocomplete: O(m + n)
 * where m = word length, n = number of matches
 */

interface TrieNodeData {
  id: string;
  displayName: string;
  popularity: number;
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isTerminal: boolean = false;
  data: TrieNodeData | null = null;
}

export class Trie {
  private root: TrieNode = new TrieNode();
  private totalWords: number = 0;

  get size(): number {
    return this.totalWords;
  }

  // O(m) — Insert a word into the trie
  insert(word: string, data: TrieNodeData): void {
    let current = this.root;
    const lowerWord = word.toLowerCase();

    for (const char of lowerWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    // If this is a new word, increment count
    if (!current.isTerminal) {
      this.totalWords++;
    }

    current.isTerminal = true;
    current.data = data;
  }

  // O(m) — Check if a word exists in the trie
  search(word: string): TrieNodeData | null {
    const node = this.findNode(word.toLowerCase());
    return node && node.isTerminal ? node.data : null;
  }

  // O(m) — Check if any word starts with the prefix
  startsWith(prefix: string): boolean {
    return this.findNode(prefix.toLowerCase()) !== null;
  }

  // O(m + n) — Get all words matching a prefix, sorted by popularity
  autocomplete(prefix: string, limit: number = 10): TrieNodeData[] {
    const node = this.findNode(prefix.toLowerCase());
    if (!node) return [];

    const results: TrieNodeData[] = [];
    this.collectWords(node, results);

    // Sort by popularity (most popular first) and limit results
    return results
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // Remove a word from the trie
  remove(word: string): boolean {
    const lowerWord = word.toLowerCase();
    return this.removeHelper(this.root, lowerWord, 0);
  }

  // Increment popularity count for a word (called on each search)
  incrementPopularity(word: string): void {
    const node = this.findNode(word.toLowerCase());
    if (node && node.isTerminal && node.data) {
      node.data.popularity++;
    }
  }

  // Navigate to the node at the end of the prefix
  private findNode(prefix: string): TrieNode | null {
    let current = this.root;

    for (const char of prefix) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char)!;
    }

    return current;
  }

  // DFS to collect all terminal nodes below a given node
  private collectWords(node: TrieNode, results: TrieNodeData[]): void {
    if (node.isTerminal && node.data) {
      results.push(node.data);
    }

    for (const child of node.children.values()) {
      this.collectWords(child, results);
    }
  }

  // Recursive removal helper
  private removeHelper(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isTerminal) return false;
      node.isTerminal = false;
      node.data = null;
      this.totalWords--;
      return node.children.size === 0;
    }

    const char = word[depth];
    const child = node.children.get(char);
    if (!child) return false;

    const shouldDelete = this.removeHelper(child, word, depth + 1);

    if (shouldDelete) {
      node.children.delete(char);
      return !node.isTerminal && node.children.size === 0;
    }

    return false;
  }
}