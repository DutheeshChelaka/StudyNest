'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useRoomStore } from '@/stores/roomStore';
import { useTimerStore } from '@/stores/timerStore';
import { useSocket } from '@/hooks/useSocket';
import { Room, Message } from '@/types';
import Navbar from '@/components/layout/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const REACTION_EMOJIS = ['👍', '❤️', '😂', '✅', '🔥'];

function IconArrowLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function IconPaperclip() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconCrown() {
  return (
    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M2 19h20v2H2v-2zM2 5l5 7.5L12 3l5 9.5 5-7.5v12H2V5z" />
    </svg>
  );
}

function IconSmile() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

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
  const [uploading, setUploading] = useState(false);
  const [activeReactionMsg, setActiveReactionMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useSocket();

  useEffect(() => {
    const init = async () => {
      try {
        const roomData = await api.getRoom(roomId);
        setRoom(roomData);
        setCurrentRoom(roomData);
        const socket = getSocket();
        if (socket) socket.emit('room:join', { roomId });
      } catch (error) {
        console.error('Failed to load room:', error);
        router.push('/rooms');
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      const socket = getSocket();
      if (socket) socket.emit('room:leave', { roomId });
      clearRoom();
      clearTimer();
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleTyping = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:typing', { roomId, isTyping: true });
      setTimeout(() => socket.emit('chat:typing', { roomId, isTyping: false }), 2000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadResult = await api.uploadFile(file);
      const socket = getSocket();
      if (socket) {
        socket.emit('chat:send', {
          roomId,
          content: null,
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendReaction = (messageId: string, emoji: string) => {
    const socket = getSocket();
    if (socket) socket.emit('chat:react', { roomId, messageId, emoji });
    setActiveReactionMsg(null);
  };

  const startTimer = (focusDuration?: number) => {
    const socket = getSocket();
    if (socket) socket.emit('timer:start', { roomId, focusDuration: focusDuration || 1500 });
  };

  const pauseTimer = () => {
    const socket = getSocket();
    if (socket) socket.emit('timer:pause', { roomId });
  };

  const resumeTimer = () => {
    const socket = getSocket();
    if (socket) socket.emit('timer:resume', { roomId });
  };

  const resetTimer = () => {
    const socket = getSocket();
    if (socket) socket.emit('timer:reset', { roomId });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${fileUrl}`;
    link.download = fileName || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timerPhaseColor = timer?.phase === 'focus'
    ? 'text-rose-500'
    : timer?.phase === 'short_break'
    ? 'text-emerald-500'
    : timer?.phase === 'long_break'
    ? 'text-blue-500'
    : 'text-gray-400';

  const timerPhaseLabel = timer?.phase === 'focus'
    ? 'Focus Time'
    : timer?.phase === 'short_break'
    ? 'Short Break'
    : timer?.phase === 'long_break'
    ? 'Long Break'
    : 'Ready';

  const timerProgress = timer
    ? ((timer.phase === 'focus' ? 1500 : timer.phase === 'short_break' ? 300 : 900) - timer.remaining) /
      (timer.phase === 'focus' ? 1500 : timer.phase === 'short_break' ? 300 : 900)
    : 0;

  const isOwner = user?.id === room?.ownerId;

  const renderMessageContent = (msg: Message) => (
    <div>
      {msg.fileUrl && msg.fileType === 'image' && (
        <div className="mb-2">
          <img
            src={`${API_URL}${msg.fileUrl}`}
            alt={msg.fileName || 'Image'}
            className="max-w-xs rounded-xl cursor-pointer hover:opacity-90 transition"
            onClick={() => window.open(`${API_URL}${msg.fileUrl}`, '_blank')}
          />
        </div>
      )}
      {msg.fileUrl && msg.fileType === 'document' && (
        <div
          onClick={() => handleDownload(msg.fileUrl!, msg.fileName || 'file')}
          className="flex items-center gap-3 bg-black/10 rounded-xl p-3 mb-2 hover:bg-black/20 transition cursor-pointer"
        >
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconFile />
          </div>
          <div className="text-left min-w-0">
            <div className="text-sm font-medium truncate">{msg.fileName}</div>
            {msg.fileSize && <div className="text-xs opacity-60">{formatFileSize(msg.fileSize)}</div>}
          </div>
          <div className="ml-auto flex-shrink-0 opacity-60">
            <IconDownload />
          </div>
        </div>
      )}
      {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{room?.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {room?.subject}
              {' · '}
              {members.length}/{room?.maxCapacity} members
              {room?.educationLevel === 'SCHOOL' && ` · Grade ${room.grade}`}
              {room?.educationLevel === 'AL' && ` · A/L ${room.stream || ''}`}
              {room?.educationLevel === 'UNI' && ' · University'}
            </p>
          </div>
          <button
            onClick={() => router.push('/rooms')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <IconArrowLeft />
            Back to Rooms
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">

            {/* Timer Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5 text-center">Pomodoro Timer</h2>

              {/* Circular progress */}
              <div className="relative flex items-center justify-center mb-5">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={timer?.phase === 'focus' ? '#F43F5E' : timer?.phase === 'short_break' ? '#10B981' : '#6D28D9'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - timerProgress)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-mono font-extrabold text-gray-900">
                    {timer ? formatTime(timer.remaining) : '25:00'}
                  </div>
                  {timer && (
                    <div className="text-xs text-gray-400 mt-0.5">#{timer.pomodoroCount + 1}</div>
                  )}
                </div>
              </div>

              <div className={`text-center text-sm font-semibold mb-5 ${timerPhaseColor}`}>
                {timerPhaseLabel}
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  {!timer || !timer.isRunning ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startTimer(1500)}
                          className="bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                        >
                          25 min
                        </button>
                        <button
                          onClick={() => startTimer(3000)}
                          className="bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                        >
                          50 min
                        </button>
                      </div>
                      {timer && !timer.isRunning && (
                        <button
                          onClick={resumeTimer}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={pauseTimer}
                        className="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                      >
                        Pause
                      </button>
                      <button
                        onClick={resetTimer}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-xs text-center">Only the room owner can control the timer</p>
              )}
            </div>

            {/* Members Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Members ({members.length})
              </h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-900 text-sm font-medium truncate">{member.name}</span>
                        {member.id === room?.ownerId && <IconCrown />}
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-220px)]">

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Chat</h2>
              <p className="text-xs text-gray-400">Share notes, ask questions, react to messages</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Say hello to your study partners!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.userId === user?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                      {!isMe && (
                        <div className="flex-shrink-0">
                          {msg.user.avatar ? (
                            <img src={msg.user.avatar} alt={msg.user.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-bold">
                              {msg.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && (
                          <span className="text-gray-400 text-xs mb-1 ml-1">{msg.user.name}</span>
                        )}

                        <div className="relative group">
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            isMe
                              ? 'bg-violet-600 text-white rounded-tr-sm'
                              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                          }`}>
                            {renderMessageContent(msg)}
                          </div>

                          <button
                            onClick={() => setActiveReactionMsg(activeReactionMsg === msg.id ? null : msg.id)}
                            className={`absolute top-1 ${isMe ? 'left-0 -translate-x-full -ml-1' : 'right-0 translate-x-full ml-1'} opacity-0 group-hover:opacity-100 bg-white border border-gray-200 shadow-sm rounded-full p-1.5 text-gray-400 hover:text-gray-600 transition-all duration-150`}
                          >
                            <IconSmile />
                          </button>

                          {activeReactionMsg === msg.id && (
                            <div className={`absolute -bottom-11 ${isMe ? 'right-0' : 'left-0'} bg-white border border-gray-100 shadow-lg rounded-2xl px-3 py-2 flex gap-2 z-20`}>
                              {REACTION_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => sendReaction(msg.id, emoji)}
                                  className="hover:scale-125 transition-transform text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex gap-1 mt-1.5 flex-wrap ${isMe ? 'justify-end' : ''}`}>
                            {Object.entries(
                              msg.reactions.reduce((acc: Record<string, { count: number; users: string[] }>, r) => {
                                if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [] };
                                acc[r.emoji].count++;
                                acc[r.emoji].users.push(r.user.name);
                                return acc;
                              }, {}),
                            ).map(([emoji, data]) => (
                              <button
                                key={emoji}
                                onClick={() => sendReaction(msg.id, emoji)}
                                title={data.users.join(', ')}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 ${
                                  msg.reactions.some((r) => r.userId === user?.id && r.emoji === emoji)
                                    ? 'bg-violet-50 border-violet-300 text-violet-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-medium">{data.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="text-gray-300 text-[10px] mt-1 mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 bg-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-gray-100">
              {uploading && (
                <div className="flex items-center gap-2 text-violet-500 text-xs mb-2">
                  <div className="w-3 h-3 border border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                  Uploading file...
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  title="Upload image or file"
                >
                  <IconPaperclip />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border border-transparent rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-violet-300 transition-all duration-200"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95"
                >
                  <IconSend />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}