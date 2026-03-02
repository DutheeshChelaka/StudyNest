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
export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  user: { id: string; name: string; avatar: string | null };
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