'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    educationLevel: 'SCHOOL',
    medium: '',
    subjects: '',
    grade: 6,
    schoolName: '',
    city: '',
    stream: '',
    universityName: '',
    course: '',
    yearOfStudy: 1,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        educationLevel: user.educationLevel || 'SCHOOL',
        medium: user.medium || '',
        subjects: user.subjects?.join(', ') || '',
        grade: user.grade || 6,
        schoolName: user.schoolName || '',
        city: user.city || '',
        stream: user.stream || '',
        universityName: user.universityName || '',
        course: user.course || '',
        yearOfStudy: user.yearOfStudy || 1,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data: any = {
        name: form.name,
        educationLevel: form.educationLevel,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (form.phone) data.phone = form.phone;
      if (form.medium) data.medium = form.medium;
      if (form.city) data.city = form.city;

      if (form.educationLevel === 'SCHOOL') {
        data.grade = Number(form.grade);
        if (form.schoolName) data.schoolName = form.schoolName;
      }

      if (form.educationLevel === 'AL') {
        if (form.stream) data.stream = form.stream;
      }

      if (form.educationLevel === 'UNI') {
        if (form.universityName) data.universityName = form.universityName;
        if (form.course) data.course = form.course;
        data.yearOfStudy = Number(form.yearOfStudy);
      }

      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="07X XXXX XXX"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Education Level</label>
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

          {/* Medium */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Medium</label>
            <select
              name="medium"
              value={form.medium}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Medium</option>
              <option value="SINHALA">Sinhala</option>
              <option value="TAMIL">Tamil</option>
              <option value="ENGLISH">English</option>
            </select>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subjects (comma separated)</label>
            <input
              type="text"
              name="subjects"
              value={form.subjects}
              onChange={handleChange}
              placeholder="e.g. Physics, Chemistry, Mathematics"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* School Fields */}
          {form.educationLevel === 'SCHOOL' && (
            <>
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={form.schoolName}
                  onChange={handleChange}
                  placeholder="e.g. Royal College"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* A/L Fields */}
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

          {/* University Fields */}
          {form.educationLevel === 'UNI' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">University</label>
                <select
                  name="universityName"
                  value={form.universityName}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select University</option>
                  <option value="SLIIT">SLIIT</option>
                  <option value="University of Moratuwa">University of Moratuwa</option>
                  <option value="University of Colombo">University of Colombo</option>
                  <option value="University of Peradeniya">University of Peradeniya</option>
                  <option value="University of Kelaniya">University of Kelaniya</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year of Study</label>
                <select
                  name="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Colombo, Kandy, Galle"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}