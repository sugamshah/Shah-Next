'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { auth } from '@/infrastructure/firebase/config';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Fill in both email and password.');
      return;
    }

    setLoadingState(true);
    try {
      await services.auth.signIn(email, password);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const admin = await services.admin.isAdmin(currentUser.uid);
        if (!admin) {
          setError('User is not authorized for admin access.');
          return;
        }
        router.push('/admin');
      }
    } catch (err: any) {
      console.error('Admin login failed:', err);
      if (err.code === 'auth/operation-not-allowed') {
        const projectId = auth.app.options.projectId;
        setError(`Email sign-in is not enabled for Firebase project ${projectId}.`);
      } else {
        setError(err.message || 'Unable to sign in.');
      }
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] p-4 text-[#e0e0e0]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#1f1f1f] bg-[#0a0a0a] p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2">Admin Login</h1>
        <p className="text-sm text-[#888] mb-8">Sign in with your administrator account to access the admin dashboard.</p>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-[#666]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#1f1f1f] bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-[#666]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#1f1f1f] bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loadingState}
            className="w-full rounded-2xl bg-[#6366f1] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#4f46e5] disabled:opacity-60"
          >
            {loadingState ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#888]">
          <p>
            Need regular access? <Link href="/login" className="text-[#6366f1] hover:underline">Sign in here</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
