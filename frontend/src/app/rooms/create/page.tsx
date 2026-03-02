'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';

export default function CreateRoomPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    subject: '',
    description: '',
    isPublic: true,
    password: '',
    maxCapacity: 10,
    educationLevel: user?.educationLevel || 'SCHOOL',
    medium: '',
    grade: user?.grade || 6,
    stream: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const roomData: any = {
        name: form.name,
        subject: form.subject,
        description: form.description || undefined,
        isPublic: form.isPublic,
        maxCapacity: Number(form.maxCapacity),
        educationLevel: form.educationLevel,
      };

      if (!form.isPublic && form.password) {
        roomData.password = form.password;
      }
      if (form.medium) roomData.medium = form.medium;
      if (form.educationLevel === 'SCHOOL') roomData.grade = Number(form.grade);
      if (form.educationLevel === 'AL' && form.stream) roomData.stream = form.stream;

      const room = await api.createRoom(roomData);
      router.push(`/rooms/${room.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Create Study Room</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Room Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Physics Study Group"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="e.g. Physics, Mathematics, Biology"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What will you be studying?"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Education Level *</label>
            <select
              name="educationLevel"
              value={form.educationLevel}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="SCHOOL">School (Grade 6-11)</option>
              <option value="AL">A/L</option>
              <option value="UNI">University</option>
            </select>
          </div>

          {/* Grade (for School) */}
          {form.educationLevel === 'SCHOOL' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                {[6, 7, 8, 9, 10, 11].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          )}

          {/* Stream (for A/L) */}
          {form.educationLevel === 'AL' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stream</label>
              <select
                name="stream"
                value={form.stream}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Stream</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          )}

          {/* Medium */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Medium</label>
            <select
              name="medium"
              value={form.medium}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Any Medium</option>
              <option value="SINHALA">Sinhala</option>
              <option value="TAMIL">Tamil</option>
              <option value="ENGLISH">English</option>
            </select>
          </div>

          {/* Max Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Capacity (2-20)</label>
            <input
              type="number"
              name="maxCapacity"
              value={form.maxCapacity}
              onChange={handleChange}
              min={2}
              max={20}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label className="text-sm text-gray-300">Public room (anyone can join)</label>
          </div>

          {/* Password (for private rooms) */}
          {!form.isPublic && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Set a password for your private room"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}