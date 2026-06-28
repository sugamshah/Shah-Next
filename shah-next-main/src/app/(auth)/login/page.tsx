'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/services/container';
import { auth } from '@/infrastructure/firebase/config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await services.auth.signIn(email, password);
      router.push('/home');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        const projectId = auth.app.options.projectId;
        setError(`Email/Password authentication is not enabled in your Firebase project (${projectId}). Please enable it in the Firebase Console under Authentication > Sign-in method.`);
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] text-[#e0e0e0] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-3xl font-bold mb-8 text-center">Welcome Back</header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#1f1f1f] bg-[#111111] text-[#e0e0e0] outline-none transition-all focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
              placeholder="Email"
              required
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#1f1f1f] bg-[#111111] text-[#e0e0e0] outline-none transition-all focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#6366f1]/20"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm opacity-90">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#a5b4fc] hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
