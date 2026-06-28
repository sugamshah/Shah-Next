'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/services/container';
import emailjs from '@emailjs/browser';
import { auth } from '@/infrastructure/firebase/config';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [tempUserData, setTempUserData] = useState<any>(null);
  
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
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);

      // Initialize EmailJS
      emailjs.init("sjn35QLyRf6R8DSMK");

      const templateParams = {
        name: name,
        code: code,
        to_email: email,
      };

      await emailjs.send("service_wrzzxpv", "template_9dn4un1", templateParams);
      
      setTempUserData({ name, email, password });
      setShowVerification(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (enteredCode !== verificationCode) {
      setError('Invalid verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await services.auth.signUp(tempUserData.email, tempUserData.password);
      const user = userCredential.user;
      
      const jgId = generateJGId(tempUserData.name);
      const handle = tempUserData.name.replace(/\s/g, "").toLowerCase() + Math.floor(100 + Math.random() * 899);
      
      // Save profile
      await services.user.saveUserProfile({
        uid: user.uid,
        name: tempUserData.name,
        email: tempUserData.email,
        photoURL: '',
        handle: handle,
        jgId: jgId,
        createdAt: Date.now(),
        banned: false,
        violationPoints: 0,
        reportCount: 0,
        correctReports: 0,
        reportAccuracy: 50
      });

      await services.auth.signOut();
      alert(`Registration successful! Your JG ID is: ${jgId}`);
      router.push('/login');
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
          {showVerification ? 'Verify Email' : 'Create Account'}
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
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-[#1f1f1f] bg-[#111111] text-center text-3xl tracking-[1rem] font-bold outline-none focus:border-[#6366f1]"
              maxLength={6}
              placeholder="000000"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-4 bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold rounded-xl transition-all shadow-lg"
            >
              {loading ? 'Verifying...' : 'Verify'}
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
