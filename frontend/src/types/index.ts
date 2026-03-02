// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  educationLevel: 'SCHOOL' | 'AL' | 'UNI';
  medium: 'SINHALA' | 'TAMIL' | 'ENGLISH' | null;
  subjects: string[];
  grade: number | null;
  schoolName: string | null;
  city: string | null;
  stream: string | null;
  universityName: string | null;
  course: string | null;
  yearOfStudy: number | null;
  createdAt: string;
  updatedAt: string;
}

// Room types
export interface Room {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  isPublic: boolean;
  maxCapacity: number;
  educationLevel: 'SCHOOL' | 'AL' | 'UNI';
  medium: 'SINHALA' | 'TAMIL' | 'ENGLISH' | null;
  grade: number | null;
  stream: string | null;
  ownerId: string;
  owner: { id: string; name: string; avatar: string | null };
  currentMembers: number;
  createdAt: string;
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
  page: number;
  totalPages: number;
}

// Message types
export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
  user: { id: string; name: string };
}

export interface Message {
  id: string;
  content: string | null;
  userId: string;
  roomId: string;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  user: { id: string; name: string; avatar: string | null };
  reactions: MessageReaction[];
  createdAt: string;
}

// Timer types
export interface TimerState {
  remaining: number;
  phase: 'focus' | 'short_break' | 'long_break';
  isRunning: boolean;
  pomodoroCount: number;
  focusDuration: number;
  breakDuration: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string | null;
  focusMinutes: number;
  rank: number;
}