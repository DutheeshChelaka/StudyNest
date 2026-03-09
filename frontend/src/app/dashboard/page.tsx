'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { LeaderboardEntry } from '@/types';
import Navbar from '@/components/layout/Navbar';

function IconTrophy() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function IconTimer() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconFire() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function IconMedal({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (rank === 3) {
    return (
      <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <span className="text-sm font-bold text-gray-400 w-6 text-center">{rank}</span>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; focusMinutes: number } | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lb, rank] = await Promise.all([
        api.getLeaderboard(period, 10),
        api.getMyRank(period),
      ]);
      setLeaderboard(lb);
      setMyRank(rank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const periodLabel = period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'All Time';

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your progress and see how you rank.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">Your Rank</span>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <IconTrophy />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {myRank ? `#${myRank.rank}` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1 capitalize">{periodLabel}</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">Focus Time</span>
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center text-violet-500">
                <IconTimer />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {myRank ? formatHours(myRank.focusMinutes) : '0m'}
            </div>
            <div className="text-xs text-gray-400 mt-1 capitalize">{periodLabel}</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">Pomodoros</span>
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                <IconFire />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {myRank ? Math.floor(myRank.focusMinutes / 25) : 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Completed</div>
          </div>

        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
              <p className="text-xs text-gray-400 mt-0.5">Top students by focus time</p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['daily', 'weekly', 'alltime'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    period === p
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p === 'daily' && 'Today'}
                  {p === 'weekly' && 'This Week'}
                  {p === 'alltime' && 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconTrophy />
                </div>
                <p className="text-gray-500 font-medium">No study data yet</p>
                <p className="text-gray-400 text-sm mt-1">Start a Pomodoro session to appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const isMe = entry.userId === user?.id;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isMe
                          ? 'bg-violet-50 border border-violet-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-6 flex items-center justify-center flex-shrink-0">
                        <IconMedal rank={entry.rank} />
                      </div>

                      {/* Avatar */}
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm truncate ${isMe ? 'text-violet-700' : 'text-gray-900'}`}>
                            {entry.name}
                          </span>
                          {isMe && (
                            <span className="text-xs bg-violet-100 text-violet-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {Math.floor(entry.focusMinutes / 25)} pomodoros
                        </div>
                      </div>

                      {/* Focus time */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-bold ${isMe ? 'text-violet-700' : 'text-gray-900'}`}>
                          {formatHours(entry.focusMinutes)}
                        </div>
                        <div className="text-xs text-gray-400">focus time</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}