'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { User, ArrowLeft, Trash2, ShieldAlert, Key, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';

export default function ManageAccountPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteRequest = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // In a real app, we would verify password here with Firebase Auth
      // For this demo, we'll simulate the scheduled deletion
      await services.user.updateUserProfile(user.uid, {
        deletionScheduled: true,
        deletionTimestamp: Date.now() + (24 * 60 * 60 * 1000)
      });
      alert('Account scheduled for deletion in 24 hours. You will be logged out now.');
      await signOut();
      router.push('/login');
    } catch (err) {
      alert('Failed to schedule deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-[#6366f1] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
            <User className="text-[#6366f1]" size={32} />
            Manage Account
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Sensitive account controls</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-red-500/20 transition-all cursor-pointer" onClick={() => setShowDeleteModal(true)}>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/5 flex items-center justify-center text-red-500 border border-red-500/10">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Account</h3>
                <p className="text-[10px] text-red-500/60 font-medium leading-tight mt-1">Permanently remove your data from SHAH</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-red-500 uppercase tracking-widest px-4 py-2 bg-red-500/5 rounded-full border border-red-500/10">Delete</button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[#0a0a0a] rounded-[3rem] border border-[#1f1f1f] overflow-hidden shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 border border-red-500/20">
                  <ShieldAlert size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verify Deletion</h2>
                  <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest">Step {step} of 3</p>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <p className="text-sm text-[#888] text-center leading-relaxed">
                    This action is irreversible. Your messages, groups, and profile will be wiped from the platform after a 24-hour grace period.
                  </p>
                  <button onClick={() => setStep(2)} className="w-full p-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs">I Understand, Continue</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-sm text-[#888] text-center leading-relaxed">Please enter your account password to confirm.</p>
                  <input 
                    type="password" 
                    placeholder="Enter Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500/50"
                  />
                  <button onClick={() => setStep(3)} disabled={!password} className="w-full p-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">Confirm Password</button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <p className="text-sm text-[#888] text-center leading-relaxed">Final confirmation: Type <span className="text-white font-bold tracking-widest">DELETE</span> below.</p>
                  <input 
                    type="text" 
                    placeholder="Type DELETE" 
                    className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500/50 text-center uppercase tracking-[0.5em]"
                    onChange={(e) => e.target.value === 'DELETE' && handleDeleteRequest()}
                  />
                  {loading && <p className="text-center text-[10px] text-[#6366f1] animate-pulse">Scheduling deletion...</p>}
                </div>
              )}

              <button onClick={() => { setShowDeleteModal(false); setStep(1); }} className="w-full text-[10px] font-black text-[#444] uppercase tracking-[0.4em] pt-4">Cancel Request</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
