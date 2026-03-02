'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { LeaderboardEntry } from '@/types';
import Navbar from '@/components/layout/Navbar';

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

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {/* My Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-white">
              {myRank ? `#${myRank.rank}` : '-'}
            </div>
            <div className="text-gray-400 text-sm">Your Rank</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">
              {myRank ? formatHours(myRank.focusMinutes) : '0m'}
            </div>
            <div className="text-gray-400 text-sm">Focus Time ({period})</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-white">
              {myRank ? Math.floor(myRank.focusMinutes / 25) : 0}
            </div>
            <div className="text-gray-400 text-sm">Pomodoros Completed</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Leaderboard</h2>

            {/* Period Tabs */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {(['daily', 'weekly', 'alltime'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                    period === p
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p === 'daily' && 'Today'}
                  {p === 'weekly' && 'This Week'}
                  {p === 'alltime' && 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No study data yet. Start a Pomodoro session!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    entry.userId === user?.id
                      ? 'bg-indigo-600/10 border border-indigo-500/30'
                      : 'bg-gray-800/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                    {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                    {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                    {entry.rank > 3 && (
                      <span className="text-gray-400 font-bold">{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  {entry.avatar ? (
                    <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
                      {entry.name.charAt(0)}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1">
                    <span className="text-white font-medium">{entry.name}</span>
                    {entry.userId === user?.id && (
                      <span className="text-indigo-400 text-xs ml-2">(You)</span>
                    )}
                  </div>

                  {/* Focus Time */}
                  <div className="text-right">
                    <div className="text-white font-semibold">{formatHours(entry.focusMinutes)}</div>
                    <div className="text-gray-500 text-xs">
                      {Math.floor(entry.focusMinutes / 25)} pomodoros
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}