'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useRoomStore } from '@/stores/roomStore';
import { useTimerStore } from '@/stores/timerStore';

export function useSocket() {
  const { setMembers, addMessage, setMessages, setTypingUser } = useRoomStore();
  const { setTimer } = useTimerStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Room events (Section 7)
    socket.on('room:members', (data) => {
      setMembers(data.members);
    });

    socket.on('room:user_joined', (data) => {
      console.log(`📚 ${data.user.name} joined the room`);
    });

    socket.on('room:user_left', (data) => {
      console.log(`👋 ${data.user.name} left the room`);
    });

    // Chat events (Section 7)
    socket.on('chat:receive', (data) => {
      addMessage(data.message);
    });

    socket.on('chat:history', (data) => {
      setMessages(data.messages);
    });

    socket.on('chat:typing_update', (data) => {
      setTypingUser(data.userId, data.isTyping);
    });

    // Timer events (Section 7)
    socket.on('timer:tick', (data) => {
      setTimer(data.state);
    });

    socket.on('timer:complete', (data) => {
      console.log(`⏱️ ${data.type} completed!`);
    });

    // Presence events
    socket.on('presence:online', (data) => {
      console.log(`🟢 User ${data.userId} is ${data.status}`);
    });

    socket.on('presence:offline', (data) => {
      console.log(`🔴 User ${data.userId} went offline`);
    });

    // Cleanup on unmount
    return () => {
      socket.off('room:members');
      socket.off('room:user_joined');
      socket.off('room:user_left');
      socket.off('chat:receive');
      socket.off('chat:history');
      socket.off('chat:typing_update');
      socket.off('timer:tick');
      socket.off('timer:complete');
      socket.off('presence:online');
      socket.off('presence:offline');
    };
  }, [setMembers, addMessage, setMessages, setTypingUser, setTimer]);
}