import { create } from 'zustand';
import { TimerState } from '@/types';

interface TimerStoreState {
  timer: TimerState | null;

  // Actions
  setTimer: (timer: TimerState) => void;
  clearTimer: () => void;
}

export const useTimerStore = create<TimerStoreState>((set) => ({
  timer: null,

  setTimer: (timer) => set({ timer }),

  clearTimer: () => set({ timer: null }),
}));