'use client';

import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const googleLoginUrl = `${API_URL}/auth/google`;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Study Together,{' '}
            <span className="text-indigo-500">Achieve More</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Join virtual study rooms with students across Sri Lanka.
            Stay focused with shared Pomodoro timers, chat with peers,
            and climb the leaderboard.
          </p>
          
            <a href={googleLoginUrl} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Get Started with Google
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-white mb-2">Virtual Study Rooms</h3>
            <p className="text-gray-400 text-sm">
              Create or join rooms organized by subject and grade.
              See who is studying in real-time.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Shared Pomodoro Timer</h3>
            <p className="text-gray-400 text-sm">
              Stay focused together with synchronized timers.
              Everyone studies and takes breaks at the same time.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-white mb-2">Leaderboard & Achievements</h3>
            <p className="text-gray-400 text-sm">
              Track your study hours and compete with friends.
              Earn badges for consistent studying.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Chat</h3>
            <p className="text-gray-400 text-sm">
              Coordinate study topics, ask questions, and share
              resources with room members.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Room Matching</h3>
            <p className="text-gray-400 text-sm">
              Quick Join finds the perfect room based on your
              subject, friends, and preferences.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">For All Students</h3>
            <p className="text-gray-400 text-sm">
              Grade 6 to University. Sinhala, Tamil, or English medium.
              Rooms matched to your education level.
            </p>
          </div>
        </div>

        {/* Education Levels */}
        <div className="text-center mt-24">
          <h2 className="text-3xl font-bold text-white mb-8">Built for Every Student</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl px-8 py-4">
              <div className="text-2xl mb-1">🏫</div>
              <div className="text-white font-semibold">Grade 6 - 11</div>
              <div className="text-emerald-400 text-sm">O/L Students</div>
            </div>
            <div className="bg-blue-900/30 border border-blue-800 rounded-xl px-8 py-4">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-white font-semibold">A/L Students</div>
              <div className="text-blue-400 text-sm">Science · Commerce · Arts · Tech</div>
            </div>
            <div className="bg-purple-900/30 border border-purple-800 rounded-xl px-8 py-4">
              <div className="text-2xl mb-1">🎓</div>
              <div className="text-white font-semibold">University</div>
              <div className="text-purple-400 text-sm">SLIIT · Moratuwa · Colombo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}