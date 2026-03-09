'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function IconBook() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function IconRooms() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const googleLoginUrl = `${API_URL}/auth/google`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <IconBook />
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">StudyNest</span>
        </Link>

        {/* Nav Links */}
        {isAuthenticated && (
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/rooms"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <IconRooms />
              Study Rooms
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <IconDashboard />
              Dashboard
            </Link>
            <Link
              href="/ai"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <IconAI />
              AI Coach
            </Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 hover:bg-gray-100 px-2.5 py-1.5 rounded-xl transition-all duration-200"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-700 text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <IconLogout />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href={googleLoginUrl}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-violet-200 active:scale-95"
            >
              Sign in with Google
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}