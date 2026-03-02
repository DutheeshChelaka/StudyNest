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

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.emit('room:leave', { roomId });
      }
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
      setTimeout(() => {
        socket.emit('chat:typing', { roomId, isTyping: false });
      }, 2000);
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
    if (socket) {
      socket.emit('chat:react', { roomId, messageId, emoji });
    }
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

  const renderMessageContent = (msg: Message) => {
    return (
      <div>
        {msg.fileUrl && msg.fileType === 'image' && (
          <div className="mb-2">
            <img
              src={`${API_URL}${msg.fileUrl}`}
              alt={msg.fileName || 'Image'}
              className="max-w-sm rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(`${API_URL}${msg.fileUrl}`, '_blank')}
            />
          </div>
        )}
        {msg.fileUrl && msg.fileType === 'document' && (
          <div
            onClick={() => handleDownload(msg.fileUrl!, msg.fileName || 'file')}
            className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3 mb-2 hover:bg-gray-700 transition cursor-pointer"
          >
            <span className="text-2xl">
              {msg.fileName?.endsWith('.pdf') ? '📕' : '📄'}
            </span>
            <div className="text-left">
              <div className="text-white text-sm font-medium">{msg.fileName}</div>
              {msg.fileSize && <div className="text-gray-400 text-xs">{formatFileSize(msg.fileSize)}</div>}
            </div>
            <span className="ml-auto text-indigo-400 text-sm">⬇ Download</span>
          </div>
        )}
        {msg.content && <p className="text-sm">{msg.content}</p>}
      </div>
    );
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
          <button onClick={() => router.push('/rooms')} className="text-gray-400 hover:text-white text-sm transition">
            ← Back to Rooms
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">Pomodoro Timer</h2>

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
                  <div className="text-gray-500 text-xs mt-1">Pomodoro #{timer.pomodoroCount + 1}</div>
                )}
              </div>

              {isOwner && (
                <div className="space-y-2">
                  {!timer || !timer.isRunning ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => startTimer(1500)} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition">25 min</button>
                      <button onClick={() => startTimer(3000)} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition">50 min</button>
                      {timer && !timer.isRunning && (
                        <button onClick={resumeTimer} className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">▶ Resume</button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={pauseTimer} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm font-medium transition">⏸ Pause</button>
                      <button onClick={resetTimer} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition">⏹ Reset</button>
                    </div>
                  )}
                </div>
              )}

              {!isOwner && (
                <p className="text-gray-500 text-xs text-center">Only the room owner can control the timer</p>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Members ({members.length})</h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">{member.name.charAt(0)}</div>
                    )}
                    <div>
                      <span className="text-white text-sm">{member.name}</span>
                      {member.id === room?.ownerId && <span className="text-yellow-500 text-xs ml-2">👑 Owner</span>}
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[calc(100vh-200px)]">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>No messages yet. Say hello! 👋</p>
                  <p className="text-xs mt-2">You can share images, files, and react to messages</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.userId === user?.id ? 'justify-end' : ''}`}>
                    {msg.userId !== user?.id && (
                      <div className="flex-shrink-0">
                        {msg.user.avatar ? (
                          <img src={msg.user.avatar} alt={msg.user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">{msg.user.name.charAt(0)}</div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${msg.userId === user?.id ? 'text-right' : ''}`}>
                      {msg.userId !== user?.id && (
                        <span className="text-gray-400 text-xs">{msg.user.name}</span>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl relative group ${
                          msg.userId === user?.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        {renderMessageContent(msg)}

                        <button
                          onClick={() => setActiveReactionMsg(activeReactionMsg === msg.id ? null : msg.id)}
                          className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-700 rounded-full px-2 py-0.5 text-xs transition hover:bg-gray-600"
                        >
                          😀
                        </button>

                        {activeReactionMsg === msg.id && (
                          <div className="absolute -bottom-10 right-0 bg-gray-700 rounded-lg px-2 py-1 flex gap-1 z-10 shadow-lg">
                            {REACTION_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => sendReaction(msg.id, emoji)}
                                className="hover:scale-125 transition text-lg px-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex gap-1 mt-1 flex-wrap ${msg.userId === user?.id ? 'justify-end' : ''}`}>
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
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition ${
                                msg.reactions.some((r) => r.userId === user?.id && r.emoji === emoji)
                                  ? 'bg-indigo-600/30 border border-indigo-500'
                                  : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-gray-300">{data.count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-gray-600 text-xs">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {typingUsers.length > 0 && (
                <div className="text-gray-500 text-xs italic">Someone is typing...</div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-gray-800">
              {uploading && (
                <div className="text-indigo-400 text-xs mb-2">Uploading file...</div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-3 py-3 rounded-xl transition"
                  title="Upload image or file"
                >
                  📎
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