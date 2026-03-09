'use client';

import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function IconHome() {
  return (
    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function IconTimer() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconBadge() {
  return (
    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconBulb() {
  return (
    <svg className="w-6 h-6 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function IconSchool() {
  return (
    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  );
}

function IconBookBlue() {
  return (
    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconBookWhite() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconBookViolet() {
  return (
    <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function IconBookCTA() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Home() {
  const googleLoginUrl = `${API_URL}/auth/google`;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <IconBookWhite />
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">StudyNest</span>
          </div>
          <Link
            href={googleLoginUrl}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-violet-200 active:scale-95"
          >
            Get Started
            <IconArrow />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-violet-100 via-purple-50 to-transparent rounded-full opacity-60 blur-3xl" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full opacity-30 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">

          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Sri Lanka&apos;s Virtual Study Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
            Study Together,{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                Achieve More
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-[5px] bg-gradient-to-r from-violet-200 to-purple-200 rounded-full" />
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join virtual study rooms with students across Sri Lanka. Stay focused with shared Pomodoro timers,
            chat with peers, and climb the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={googleLoginUrl}
              className="inline-flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-violet-200 active:scale-95"
            >
              Continue with Google
              <IconArrow />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 px-6 py-4 rounded-2xl text-lg font-medium transition-colors"
            >
              See how it works
              <IconChevronDown />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">500+</div>
              <div className="text-sm text-gray-400 mt-1">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">50+</div>
              <div className="text-sm text-gray-400 mt-1">Study Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">2.5hrs</div>
              <div className="text-sm text-gray-400 mt-1">Avg Daily Focus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">99%</div>
              <div className="text-sm text-gray-400 mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Built for how students actually study
          </h2>
          <p className="text-gray-400 mt-4 text-lg max-w-xl mx-auto">
            Every feature is designed around real student needs — from accountability to AI-powered revision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="group bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <IconHome />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Virtual Study Rooms</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Create or join rooms organized by subject and grade. See who is studying in real-time.</p>
          </div>

          <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <IconTimer />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Shared Pomodoro Timer</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Stay focused together with synchronized timers. Everyone studies and takes breaks at the same time.</p>
          </div>

          <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <IconBadge />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Leaderboard &amp; Achievements</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Track your study hours and compete with friends. Earn badges for consistent studying.</p>
          </div>

          <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <IconChat />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Real-Time Chat</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Coordinate study topics, ask questions, and share resources with room members.</p>
          </div>

          <div className="group bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <IconBolt />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Smart Room Matching</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Quick Join finds the perfect room based on your subject, friends, and preferences.</p>
          </div>

          <div className="group bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <IconBulb />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">AI Study Coach</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Upload your notes and get personalized quizzes. Spaced repetition targets your weak areas.</p>
          </div>

        </div>
      </section>

      {/* Education Levels */}
      <section className="bg-white border-y border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">For every student</p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Built for Every Student
          </h2>
          <p className="text-gray-400 text-lg mb-14 max-w-lg mx-auto">
            Rooms matched to your education level, subject, and medium of instruction.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-3xl mx-auto">

            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-2xl px-8 py-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <IconSchool />
              </div>
              <div className="text-lg font-bold text-emerald-700">Grade 6 - 11</div>
              <div className="text-sm mt-1 text-emerald-500">O/L Students</div>
            </div>

            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-2xl px-8 py-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <IconBookBlue />
              </div>
              <div className="text-lg font-bold text-blue-700">A/L Students</div>
              <div className="text-sm mt-1 text-blue-500">Science · Commerce · Arts · Tech</div>
            </div>

            <div className="flex-1 bg-violet-50 border border-violet-200 rounded-2xl px-8 py-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <IconBookViolet />
              </div>
              <div className="text-lg font-bold text-violet-700">University</div>
              <div className="text-sm mt-1 text-violet-500">SLIIT · Moratuwa · Colombo</div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl px-8 py-16 text-center">
          <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-64 h-64 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IconBookCTA />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to study smarter?
            </h2>
            <p className="text-violet-200 text-lg mb-10 max-w-md mx-auto">
              Join thousands of Sri Lankan students who study together on StudyNest every day.
            </p>
            <Link
              href={googleLoginUrl}
              className="inline-flex items-center gap-3 bg-white text-violet-700 hover:bg-violet-50 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 hover:shadow-2xl active:scale-95"
            >
              Start Studying for Free
              <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <IconBookWhite />
            </div>
            <span className="text-gray-400 text-sm font-medium">StudyNest</span>
          </div>
          <p className="text-gray-400 text-sm">Built for students across Sri Lanka</p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Dashboard
            </Link>
            <Link href="/rooms" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Rooms
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}