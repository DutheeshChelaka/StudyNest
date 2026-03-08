'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const googleLoginUrl = `${API_URL}/auth/google`;

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-white">StudyNest</span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-6">
              <Link href="/rooms" className="text-gray-300 hover:text-white transition">
                Study Rooms
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/ai" className="text-gray-400 hover:text-white transition text-sm">AI Coach</Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-gray-300 text-sm hidden sm:block">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">
                  Logout
                </button>
              </div>
            ) : (
              <a href={googleLoginUrl} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Sign in with Google
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}