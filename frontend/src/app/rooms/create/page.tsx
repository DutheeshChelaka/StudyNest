'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';

function IconArrowLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );
}

const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200";

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
      const roomData: Record<string, unknown> = {
        name: form.name,
        subject: form.subject,
        description: form.description || undefined,
        isPublic: form.isPublic,
        maxCapacity: Number(form.maxCapacity),
        educationLevel: form.educationLevel,
      };

      if (!form.isPublic && form.password) roomData.password = form.password;
      if (form.medium) roomData.medium = form.medium;
      if (form.educationLevel === 'SCHOOL') roomData.grade = Number(form.grade);
      if (form.educationLevel === 'AL' && form.stream) roomData.stream = form.stream;

      const room = await api.createRoom(roomData);
      router.push(`/rooms/${room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/rooms')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <IconArrowLeft />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Study Room</h1>
            <p className="text-gray-400 text-sm mt-0.5">Set up a room for your study session.</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <IconAlertCircle />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Card: Basic Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Basic Info</h2>

            <div>
              <FieldLabel required>Room Name</FieldLabel>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Physics Study Group"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel required>Subject</FieldLabel>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="e.g. Physics, Mathematics, Biology"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="What will you be studying? Any requirements?"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Card: Education */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Education</h2>

            <div>
              <FieldLabel required>Education Level</FieldLabel>
              <div className="relative">
                <select
                  name="educationLevel"
                  value={form.educationLevel}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="SCHOOL">School (Grade 6-11)</option>
                  <option value="AL">A/L</option>
                  <option value="UNI">University</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {form.educationLevel === 'SCHOOL' && (
              <div>
                <FieldLabel>Grade</FieldLabel>
                <div className="grid grid-cols-6 gap-2">
                  {[6, 7, 8, 9, 10, 11].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, grade: g }))}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                        Number(form.grade) === g
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.educationLevel === 'AL' && (
              <div>
                <FieldLabel>Stream</FieldLabel>
                <div className="relative">
                  <select
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="">Select Stream</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                    <option value="Technology">Technology</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            <div>
              <FieldLabel>Medium of Instruction</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '', label: 'Any' },
                  { value: 'SINHALA', label: 'Sinhala' },
                  { value: 'TAMIL', label: 'Tamil' },
                  { value: 'ENGLISH', label: 'English' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, medium: opt.value }))}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                      form.medium === opt.value
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Room Settings */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Room Settings</h2>

            <div>
              <FieldLabel>Max Capacity</FieldLabel>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="maxCapacity"
                  value={form.maxCapacity}
                  onChange={handleChange}
                  min={2}
                  max={20}
                  className="flex-1 accent-violet-600"
                />
                <div className="w-14 text-center bg-violet-50 border border-violet-200 text-violet-700 font-bold text-sm py-1.5 rounded-xl">
                  {form.maxCapacity}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Between 2 and 20 members</p>
            </div>

            {/* Visibility toggle */}
            <div>
              <FieldLabel>Visibility</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isPublic: true }))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                    form.isPublic
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <IconGlobe />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isPublic: false }))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                    !form.isPublic
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <IconLock />
                  Private
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {form.isPublic ? 'Anyone can discover and join this room.' : 'Only people with the password can join.'}
              </p>
            </div>

            {!form.isPublic && (
              <div>
                <FieldLabel>Room Password</FieldLabel>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Set a password for your private room"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-200 active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Room...
              </span>
            ) : (
              'Create Room'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}