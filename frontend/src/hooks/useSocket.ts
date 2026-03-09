'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useRoomStore } from '@/stores/roomStore';
import { useTimerStore } from '@/stores/timerStore';

export function useSocket() {
  const { setMembers, addMessage, setMessages, setTypingUser, updateMessageReactions } = useRoomStore();
  const { setTimer } = useTimerStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Room events
    socket.on('room:members', (data) => {
      setMembers(data.members);
    });

    socket.on('room:user_joined', (data) => {
      if (data?.user?.name) {
        console.log(`📚 ${data.user.name} joined the room`);
      }
      // Re-request updated member list
      // The server already sends room:members after join, so this is just a safety log
    });

    socket.on('room:user_left', (data) => {
      if (data?.user?.name) {
        console.log(`👋 ${data.user.name} left the room`);
      }
      // The server sends updated room:members after leave
    });

    // Chat events
    socket.on('chat:receive', (data) => {
      if (data?.message) {
        addMessage(data.message);
      }
    });

    socket.on('chat:history', (data) => {
      if (data?.messages) {
        setMessages(data.messages);
      }
    });

    socket.on('chat:typing_update', (data) => {
      if (data?.userId !== undefined) {
        setTypingUser(data.userId, data.isTyping);
      }
    });

    // Reaction events
    socket.on('chat:reaction_update', (data) => {
      if (data?.messageId && data?.reactions) {
        updateMessageReactions(data.messageId, data.reactions);
      }
    });

    // Timer events
    socket.on('timer:tick', (data) => {
      if (data?.state) {
        setTimer(data.state);
      }
    });

    socket.on('timer:complete', (data) => {
      console.log(`⏱️ ${data?.type} completed!`);
    });

    // Achievement events
    socket.on('achievement:unlocked', (data) => {
      if (data?.achievements) {
        console.log(`🏆 Achievements unlocked: ${data.achievements.join(', ')}`);
      }
    });

    // Presence events
    socket.on('presence:online', (data) => {
      // Silently handle
    });

    socket.on('presence:offline', (data) => {
      // Silently handle
    });

    return () => {
      socket.off('room:members');
      socket.off('room:user_joined');
      socket.off('room:user_left');
      socket.off('chat:receive');
      socket.off('chat:history');
      socket.off('chat:typing_update');
      socket.off('chat:reaction_update');
      socket.off('timer:tick');
      socket.off('timer:complete');
      socket.off('achievement:unlocked');
      socket.off('presence:online');
      socket.off('presence:offline');
    };
  }, [setMembers, addMessage, setMessages, setTypingUser, updateMessageReactions, setTimer]);
}