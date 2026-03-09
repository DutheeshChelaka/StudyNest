'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Room } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

function IconSearch() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function OccupancyBar({ current, max }: { current: number; max: number }) {
  const pct = Math.round((current / max) * 100);
  const color = pct >= 90 ? 'bg-rose-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const educationLabels: Record<string, string> = {
  SCHOOL: 'School',
  AL: 'A/L',
  UNI: 'University',
};

const subjectColors: Record<string, string> = {
  Maths: 'bg-violet-100 text-violet-700',
  ICT: 'bg-blue-100 text-blue-700',
  Science: 'bg-emerald-100 text-emerald-700',
  English: 'bg-amber-100 text-amber-700',
  Physics: 'bg-indigo-100 text-indigo-700',
  Chemistry: 'bg-rose-100 text-rose-700',
};

function subjectStyle(subject: string) {
  return subjectColors[subject] ?? 'bg-gray-100 text-gray-600';
}

export default function RoomsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [educationFilter, setEducationFilter] = useState('');

  useEffect(() => {
    fetchRooms();
  }, [educationFilter]);

  const fetchRooms = async () => {
    try {
      const params: Record<string, string> = {};
      if (educationFilter) params.educationLevel = educationFilter;
      if (search) params.search = search;
      const data = await api.getRooms(params);
      setRooms(data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Study Rooms</h1>
            <p className="text-gray-400 mt-1">Find a room and study with others in real-time.</p>
          </div>
          <Link
            href="/rooms/create"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-violet-200 active:scale-95"
          >
            <IconPlus />
            Create Room
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <IconSearch />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms by name..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </form>

          <div className="relative">
            <select
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="SCHOOL">School (Grade 6-11)</option>
              <option value="AL">A/L</option>
              <option value="UNI">University</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconChevron />
            </div>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IconHome />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              No study rooms match your filters. Be the first to create one!
            </p>
            <Link
              href="/rooms/create"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-200 active:scale-95"
            >
              <IconPlus />
              Create a Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-violet-200 transition-all duration-200 cursor-pointer h-full flex flex-col">

                  {/* Top row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${subjectStyle(room.subject)}`}>
                      {room.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!room.isPublic && <IconLock />}
                      <span className="text-xs text-gray-400 font-medium">
                        {educationLabels[room.educationLevel] ?? room.educationLevel}
                      </span>
                    </div>
                  </div>

                  {/* Room name + description */}
                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                      {room.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    {/* Occupancy bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 text-gray-400">
                          <IconUsers />
                          <span className="text-xs">{room.currentMembers} studying</span>
                        </div>
                        <span className="text-xs text-gray-400">{room.currentMembers}/{room.maxCapacity}</span>
                      </div>
                      <OccupancyBar current={room.currentMembers} max={room.maxCapacity} />
                    </div>

                    {/* Owner */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {room.owner.avatar ? (
                        <img
                          src={room.owner.avatar}
                          alt={room.owner.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">
                          {room.owner.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-gray-400 text-xs truncate">{room.owner.name}</span>
                      {room.educationLevel === 'SCHOOL' && room.grade && (
                        <span className="ml-auto text-xs text-gray-300 flex-shrink-0">Grade {room.grade}</span>
                      )}
                      {room.educationLevel === 'AL' && room.stream && (
                        <span className="ml-auto text-xs text-gray-300 flex-shrink-0">{room.stream}</span>
                      )}
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}