'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token).then(() => router.push('/rooms'));
    } else {
      router.push('/');
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-12 py-10 flex flex-col items-center gap-4">

        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-violet-100" />
          <div className="absolute inset-0 rounded-full border-2 border-t-violet-600 animate-spin" />
          {/* Logo dot in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-violet-600 rounded-md" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-900 font-bold text-base">Signing you in</p>
          <p className="text-gray-400 text-sm mt-0.5">Just a moment...</p>
        </div>

      </div>
    </div>
  );
}