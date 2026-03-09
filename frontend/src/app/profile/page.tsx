'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';

const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200";
const selectClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 appearance-none pr-9";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-2">{children}</label>;
}

function ChevronDown() {
  return (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">{children}</h2>;
}

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
      const data: Record<string, unknown> = {
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
      if (form.educationLevel === 'AL' && form.stream) data.stream = form.stream;
      if (form.educationLevel === 'UNI') {
        if (form.universityName) data.universityName = form.universityName;
        if (form.course) data.course = form.course;
        data.yearOfStudy = Number(form.yearOfStudy);
      }

      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your account information and study preferences.</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 mb-6">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-gray-900 font-bold text-base">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-1.5 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full">
              {user?.educationLevel === 'SCHOOL' ? 'School' : user?.educationLevel === 'AL' ? 'A/L' : 'University'}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            <IconCheck />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            <IconAlert />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Card: Personal Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <SectionHeading>Personal Info</SectionHeading>

            <div>
              <FieldLabel>Display Name</FieldLabel>
              <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="07X XXXX XXX"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel>City</FieldLabel>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Colombo, Kandy, Galle"
                className={inputClass}
              />
            </div>
          </div>

          {/* Card: Education */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <SectionHeading>Education</SectionHeading>

            <div>
              <FieldLabel>Education Level</FieldLabel>
              <div className="relative">
                <select name="educationLevel" value={form.educationLevel} onChange={handleChange} className={selectClass}>
                  <option value="SCHOOL">School (Grade 6–11)</option>
                  <option value="AL">A/L</option>
                  <option value="UNI">University</option>
                </select>
                <ChevronDown />
              </div>
            </div>

            <div>
              <FieldLabel>Medium of Instruction</FieldLabel>
              <div className="relative">
                <select name="medium" value={form.medium} onChange={handleChange} className={selectClass}>
                  <option value="">Select Medium</option>
                  <option value="SINHALA">Sinhala</option>
                  <option value="TAMIL">Tamil</option>
                  <option value="ENGLISH">English</option>
                </select>
                <ChevronDown />
              </div>
            </div>

            <div>
              <FieldLabel>Subjects</FieldLabel>
              <input
                type="text"
                name="subjects"
                value={form.subjects}
                onChange={handleChange}
                placeholder="e.g. Physics, Chemistry, Mathematics"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1.5">Separate subjects with commas.</p>
            </div>

            {/* School fields */}
            {form.educationLevel === 'SCHOOL' && (
              <>
                <div>
                  <FieldLabel>Grade</FieldLabel>
                  <div className="grid grid-cols-6 gap-2">
                    {[6, 7, 8, 9, 10, 11].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, grade: g }))}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all duration-150 ${
                          Number(form.grade) === g
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>School Name</FieldLabel>
                  <input
                    type="text"
                    name="schoolName"
                    value={form.schoolName}
                    onChange={handleChange}
                    placeholder="e.g. Royal College"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* A/L fields */}
            {form.educationLevel === 'AL' && (
              <div>
                <FieldLabel>Stream</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {['Science', 'Commerce', 'Arts', 'Technology'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, stream: s }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                        form.stream === s
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* University fields */}
            {form.educationLevel === 'UNI' && (
              <>
                <div>
                  <FieldLabel>University</FieldLabel>
                  <div className="relative">
                    <select name="universityName" value={form.universityName} onChange={handleChange} className={selectClass}>
                      <option value="">Select University</option>
                      <option value="SLIIT">SLIIT</option>
                      <option value="University of Moratuwa">University of Moratuwa</option>
                      <option value="University of Colombo">University of Colombo</option>
                      <option value="University of Peradeniya">University of Peradeniya</option>
                      <option value="University of Kelaniya">University of Kelaniya</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div>
                  <FieldLabel>Course</FieldLabel>
                  <input
                    type="text"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g. BSc Computer Science"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Year of Study</FieldLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, yearOfStudy: y }))}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition-all duration-150 ${
                          Number(form.yearOfStudy) === y
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        Year {y}
                      </button>
                    ))}
                  </div>
                </div>
              </>
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
                Saving...
              </span>
            ) : (
              'Save Profile'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}