import { create } from 'zustand';
import { Room, Message } from '@/types';

interface RoomState {
  currentRoom: Room | null;
  members: { id: string; name: string; avatar: string | null }[];
  messages: Message[];
  typingUsers: string[];

  // Actions
  setCurrentRoom: (room: Room | null) => void;
  setMembers: (members: any[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  members: [],
  messages: [],
  typingUsers: [],

  setCurrentRoom: (room) => set({ currentRoom: room }),

  setMembers: (members) => set({ members }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),

  setTypingUser: (userId, isTyping) =>
    set((state) => ({
      typingUsers: isTyping
        ? [...state.typingUsers.filter((id) => id !== userId), userId]
        : state.typingUsers.filter((id) => id !== userId),
    })),

  clearRoom: () =>
    set({ currentRoom: null, members: [], messages: [], typingUsers: [] }),
}));