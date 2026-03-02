import { Trie } from '../../src/algorithms/trie';

describe('Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  describe('Insert and Search', () => {
    it('should start empty', () => {
      expect(trie.size).toBe(0);
      expect(trie.search('anything')).toBeNull();
    });

    it('should insert and find a word', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });

      const result = trie.search('physics');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.displayName).toBe('Physics');
    });

    it('should return null for non-existent word', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      expect(trie.search('chemistry')).toBeNull();
    });

    it('should be case insensitive', () => {
      trie.insert('Physics', { id: '1', displayName: 'Physics', popularity: 0 });

      expect(trie.search('physics')).not.toBeNull();
      expect(trie.search('PHYSICS')).not.toBeNull();
      expect(trie.search('PhYsIcS')).not.toBeNull();
    });

    it('should handle multiple insertions', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 5 });
      trie.insert('chemistry', { id: '2', displayName: 'Chemistry', popularity: 3 });
      trie.insert('biology', { id: '3', displayName: 'Biology', popularity: 7 });

      expect(trie.size).toBe(3);
      expect(trie.search('physics')?.id).toBe('1');
      expect(trie.search('chemistry')?.id).toBe('2');
      expect(trie.search('biology')?.id).toBe('3');
    });

    it('should not count prefix as a word', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      expect(trie.search('phys')).toBeNull();
    });

    it('should update data when inserting duplicate word', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics Old', popularity: 0 });
      trie.insert('physics', { id: '2', displayName: 'Physics New', popularity: 5 });

      expect(trie.size).toBe(1);
      expect(trie.search('physics')?.displayName).toBe('Physics New');
    });
  });

  describe('startsWith', () => {
    it('should find existing prefix', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      expect(trie.startsWith('phy')).toBe(true);
      expect(trie.startsWith('phys')).toBe(true);
      expect(trie.startsWith('physics')).toBe(true);
    });

    it('should return false for non-existent prefix', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      expect(trie.startsWith('che')).toBe(false);
      expect(trie.startsWith('z')).toBe(false);
    });

    it('should return false for empty trie', () => {
      expect(trie.startsWith('a')).toBe(false);
    });
  });

  describe('Autocomplete', () => {
    beforeEach(() => {
      trie.insert('physics study group', { id: '1', displayName: 'Physics Study Group', popularity: 10 });
      trie.insert('physics homework', { id: '2', displayName: 'Physics Homework', popularity: 5 });
      trie.insert('physical education', { id: '3', displayName: 'Physical Education', popularity: 2 });
      trie.insert('chemistry lab', { id: '4', displayName: 'Chemistry Lab', popularity: 8 });
      trie.insert('chemistry basics', { id: '5', displayName: 'Chemistry Basics', popularity: 3 });
    });

    it('should return all matches for a prefix', () => {
      const results = trie.autocomplete('phy');
      expect(results.length).toBe(3);
    });

    it('should sort results by popularity (highest first)', () => {
      const results = trie.autocomplete('phy');
      expect(results[0].displayName).toBe('Physics Study Group');
      expect(results[1].displayName).toBe('Physics Homework');
      expect(results[2].displayName).toBe('Physical Education');
    });

    it('should respect limit parameter', () => {
      const results = trie.autocomplete('phy', 2);
      expect(results.length).toBe(2);
      expect(results[0].popularity).toBe(10);
    });

    it('should return empty array for non-matching prefix', () => {
      const results = trie.autocomplete('bio');
      expect(results.length).toBe(0);
    });

    it('should return empty array for empty trie prefix', () => {
      const emptyTrie = new Trie();
      expect(emptyTrie.autocomplete('test').length).toBe(0);
    });

    it('should match exact word as prefix', () => {
      const results = trie.autocomplete('chemistry lab');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('4');
    });
  });

  describe('Remove', () => {
    it('should remove an existing word', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      expect(trie.remove('physics')).toBe(true);
      expect(trie.search('physics')).toBeNull();
      expect(trie.size).toBe(0);
    });

    it('should return false when removing non-existent word', () => {
      expect(trie.remove('nothing')).toBe(false);
    });

    it('should not affect other words when removing', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      trie.insert('physical', { id: '2', displayName: 'Physical', popularity: 0 });

      trie.remove('physics');
      expect(trie.search('physics')).toBeNull();
      expect(trie.search('physical')).not.toBeNull();
    });

    it('should not break prefix search after removal', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      trie.insert('physical', { id: '2', displayName: 'Physical', popularity: 0 });

      trie.remove('physical');
      expect(trie.startsWith('phys')).toBe(true);
      expect(trie.autocomplete('phys').length).toBe(1);
    });
  });

  describe('Increment Popularity', () => {
    it('should increment popularity of an existing word', () => {
      trie.insert('physics', { id: '1', displayName: 'Physics', popularity: 0 });
      trie.incrementPopularity('physics');
      trie.incrementPopularity('physics');
      trie.incrementPopularity('physics');

      expect(trie.search('physics')?.popularity).toBe(3);
    });

    it('should not crash on non-existent word', () => {
      expect(() => trie.incrementPopularity('nothing')).not.toThrow();
    });

    it('should affect autocomplete ordering', () => {
      trie.insert('physics a', { id: '1', displayName: 'Physics A', popularity: 1 });
      trie.insert('physics b', { id: '2', displayName: 'Physics B', popularity: 5 });

      // B should be first (higher popularity)
      expect(trie.autocomplete('physics')[0].id).toBe('2');

      // Increment A's popularity past B
      for (let i = 0; i < 10; i++) {
        trie.incrementPopularity('physics a');
      }

      // Now A should be first
      expect(trie.autocomplete('physics')[0].id).toBe('1');
    });
  });
});