import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Trie } from '../algorithms/trie';

@Injectable()
export class SearchService implements OnModuleInit {
  private roomTrie = new Trie();
  private userTrie = new Trie();

  constructor(private prisma: PrismaService) {}

  // Load all rooms and users into Tries on startup
  async onModuleInit() {
    await this.rebuildRoomTrie();
    await this.rebuildUserTrie();
    console.log('🔍 Search Tries initialized');
  }

  // Rebuild the room Trie from database
  async rebuildRoomTrie() {
    this.roomTrie = new Trie();

    const rooms = await this.prisma.room.findMany({
      where: { isPublic: true },
      select: { id: true, name: true, subject: true },
    });

    for (const room of rooms) {
      this.roomTrie.insert(room.name, {
        id: room.id,
        displayName: `${room.name} (${room.subject})`,
        popularity: 0,
      });
    }
  }

  // Rebuild the user Trie from database
  async rebuildUserTrie() {
    this.userTrie = new Trie();

    const users = await this.prisma.user.findMany({
      select: { id: true, name: true },
    });

    for (const user of users) {
      this.userTrie.insert(user.name, {
        id: user.id,
        displayName: user.name,
        popularity: 0,
      });
    }
  }

  // Add a new room to the Trie (called when room is created)
  addRoom(id: string, name: string, subject: string) {
    this.roomTrie.insert(name, {
      id,
      displayName: `${name} (${subject})`,
      popularity: 0,
    });
  }

  // Remove a room from the Trie (called when room is deleted)
  removeRoom(name: string) {
    this.roomTrie.remove(name);
  }

  // Add a new user to the Trie (called on first login)
  addUser(id: string, name: string) {
    this.userTrie.insert(name, {
      id,
      displayName: name,
      popularity: 0,
    });
  }

  // Autocomplete search for rooms
  searchRooms(prefix: string, limit: number = 5) {
    if (!prefix || prefix.length < 1) return [];
    const results = this.roomTrie.autocomplete(prefix, limit);
    // Increment popularity for tracking
    if (results.length > 0) {
      this.roomTrie.incrementPopularity(results[0].displayName.split(' (')[0]);
    }
    return results;
  }

  // Autocomplete search for users
  searchUsers(prefix: string, limit: number = 5) {
    if (!prefix || prefix.length < 1) return [];
    return this.userTrie.autocomplete(prefix, limit);
  }

  // Combined search (rooms + users)
  searchAll(prefix: string, limit: number = 10) {
    const rooms = this.searchRooms(prefix, Math.ceil(limit / 2));
    const users = this.searchUsers(prefix, Math.floor(limit / 2));

    return {
      rooms: rooms.map((r) => ({ id: r.id, name: r.displayName, type: 'room' })),
      users: users.map((u) => ({ id: u.id, name: u.displayName, type: 'user' })),
    };
  }
}