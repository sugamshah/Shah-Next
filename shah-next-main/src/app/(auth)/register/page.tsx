'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/services/container';
import { auth } from '@/infrastructure/firebase/config';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const router = useRouter();

  const generateJGId = (name: string) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const clean = name.replace(/\s/g, "").toLowerCase().slice(0, 5);
    return `jg-${clean}-${random}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters and include a number and uppercase letter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await services.auth.signUp(email, password);
      const user = userCredential.user;

      const jgId = generateJGId(name);
      const handle = name.replace(/\s/g, '').toLowerCase() + Math.floor(100 + Math.random() * 899);

      await services.user.saveUserProfile({
        uid: user.uid,
        name,
        email,
        photoURL: '',
        handle,
        jgId,
        createdAt: Date.now(),
        banned: false,
        violationPoints: 0,
        reportCount: 0,
        correctReports: 0,
        reportAccuracy: 50,
      });

      await services.auth.sendVerificationEmail();
      setShowVerification(true);
      setError('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        const projectId = auth.app.options.projectId;
        setError(`Email/Password authentication is not enabled in your Firebase project (${projectId}). Please enable it in the Firebase Console under Authentication > Sign-in method.`);
      } else {
        setError(err.message || 'Failed to complete registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] text-[#e0e0e0] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-3xl font-bold mb-8 text-center">
          {showVerification ? 'Check Your Inbox' : 'Create Account'}
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {!showVerification ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#1f1f1f] bg-[#111111] text-[#e0e0e0] outline-none transition-all focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#1f1f1f] bg-[#111111] text-[#e0e0e0] outline-none transition-all focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#1f1f1f] bg-[#111111] text-[#e0e0e0] outline-none transition-all focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
              placeholder="Password (min. 8 chars)"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[#6366f1]/20"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-sm opacity-80">
              We sent a verification email to <strong>{email}</strong>. Please verify it before signing in.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Continue to login
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm opacity-90">
          Already have an account?{' '}
          <Link href="/login" className="text-[#a5b4fc] hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
