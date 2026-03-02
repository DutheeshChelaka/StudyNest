'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useRoomStore } from '@/stores/roomStore';
import { useTimerStore } from '@/stores/timerStore';
import { useSocket } from '@/hooks/useSocket';
import { Room } from '@/types';
import Navbar from '@/components/layout/Navbar';

export default function RoomViewPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const { user } = useAuthStore();
  const { members, messages, typingUsers, setCurrentRoom, clearRoom } = useRoomStore();
  const { timer, clearTimer } = useTimerStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Connect WebSocket events to stores
  useSocket();

  // Fetch room details and join via WebSocket
  useEffect(() => {
    const init = async () => {
      try {
        const roomData = await api.getRoom(roomId);
        setRoom(roomData);
        setCurrentRoom(roomData);

        // Join room via WebSocket
        const socket = getSocket();
        if (socket) {
          socket.emit('room:join', { roomId });
        }
      } catch (error) {
        console.error('Failed to load room:', error);
        router.push('/rooms');
      } finally {
        setLoading(false);
      }
    };

    init();

    // Cleanup: leave room when navigating away
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.emit('room:leave', { roomId });
      }
      clearRoom();
      clearTimer();
    };
  }, [roomId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send chat message
  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('chat:send', { roomId, content: chatInput.trim() });
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Typing indicator
  const handleTyping = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:typing', { roomId, isTyping: true });
      setTimeout(() => {
        socket.emit('chat:typing', { roomId, isTyping: false });
      }, 2000);
    }
  };

  // Timer controls (owner only)
  const startTimer = (focusDuration?: number) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('timer:start', { roomId, focusDuration: focusDuration || 1500 });
    }
  };

  const pauseTimer = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('timer:pause', { roomId });
    }
  };

  const resumeTimer = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('timer:resume', { roomId });
    }
  };

  const resetTimer = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('timer:reset', { roomId });
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOwner = user?.id === room?.ownerId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Room Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{room?.name}</h1>
            <p className="text-gray-400 text-sm">
              {room?.subject} · {members.length}/{room?.maxCapacity} members
              {room?.educationLevel === 'SCHOOL' && ` · Grade ${room.grade}`}
              {room?.educationLevel === 'AL' && ` · A/L ${room.stream || ''}`}
              {room?.educationLevel === 'UNI' && ' · University'}
            </p>
          </div>
          <button
            onClick={() => router.push('/rooms')}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            ← Back to Rooms
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Timer + Members (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pomodoro Timer */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">Pomodoro Timer</h2>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-mono font-bold text-white mb-2">
                  {timer ? formatTime(timer.remaining) : '25:00'}
                </div>
                <div className={`text-sm font-medium ${
                  timer?.phase === 'focus' ? 'text-red-400' :
                  timer?.phase === 'short_break' ? 'text-green-400' :
                  timer?.phase === 'long_break' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  {timer?.phase === 'focus' && '🔴 Focus Time'}
                  {timer?.phase === 'short_break' && '🟢 Short Break'}
                  {timer?.phase === 'long_break' && '🔵 Long Break'}
                  {!timer && '⏸️ Ready'}
                </div>
                {timer && (
                  <div className="text-gray-500 text-xs mt-1">
                    Pomodoro #{timer.pomodoroCount + 1}
                  </div>
                )}
              </div>

              {/* Timer Controls (owner only) */}
              {isOwner && (
                <div className="space-y-2">
                  {!timer || !timer.isRunning ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => startTimer(1500)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        25 min
                      </button>
                      <button
                        onClick={() => startTimer(3000)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        50 min
                      </button>
                      {timer && !timer.isRunning && (
                        <button
                          onClick={resumeTimer}
                          className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition"
                        >
                          ▶ Resume
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={pauseTimer}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        ⏸ Pause
                      </button>
                      <button
                        onClick={resetTimer}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        ⏹ Reset
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isOwner && (
                <p className="text-gray-500 text-xs text-center">
                  Only the room owner can control the timer
                </p>
              )}
            </div>

            {/* Members List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Members ({members.length})
              </h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-white text-sm">{member.name}</span>
                      {member.id === room?.ownerId && (
                        <span className="text-yellow-500 text-xs ml-2">👑 Owner</span>
                      )}
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat (3 columns) */}
          <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[calc(100vh-200px)]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.userId === user?.id ? 'justify-end' : ''}`}
                  >
                    {msg.userId !== user?.id && (
                      <div className="flex-shrink-0">
                        {msg.user.avatar ? (
                          <img src={msg.user.avatar} alt={msg.user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                            {msg.user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${msg.userId === user?.id ? 'text-right' : ''}`}>
                      {msg.userId !== user?.id && (
                        <span className="text-gray-400 text-xs">{msg.user.name}</span>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          msg.userId === user?.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-gray-600 text-xs">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="text-gray-500 text-xs italic">
                  Someone is typing...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-6 py-4 border-t border-gray-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}