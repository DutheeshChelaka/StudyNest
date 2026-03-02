'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Room } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Study Rooms</h1>
          <Link
            href="/rooms/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Create Room
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms by name..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          <select
            value={educationFilter}
            onChange={(e) => setEducationFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Levels</option>
            <option value="SCHOOL">School (Grade 6-11)</option>
            <option value="AL">A/L</option>
            <option value="UNI">University</option>
          </select>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-white mb-2">No rooms found</h3>
            <p className="text-gray-400 mb-6">Be the first to create a study room!</p>
            <Link
              href="/rooms/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Create a Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500 transition cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-600/20 text-indigo-400 text-xs font-medium px-2 py-1 rounded">
                      {room.subject}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {room.currentMembers}/{room.maxCapacity} members
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">{room.name}</h3>
                  {room.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{room.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {room.owner.avatar ? (
                        <img src={room.owner.avatar} alt={room.owner.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                          {room.owner.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-gray-400 text-sm">{room.owner.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {room.educationLevel === 'SCHOOL' && `Grade ${room.grade}`}
                        {room.educationLevel === 'AL' && `A/L ${room.stream || ''}`}
                        {room.educationLevel === 'UNI' && 'University'}
                      </span>
                      {!room.isPublic && <span className="text-yellow-500 text-xs">🔒</span>}
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