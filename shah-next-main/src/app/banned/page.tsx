'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { Ban, Gavel, LogOut, Send, AlertTriangle, Clock, Skull, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { db } from '@/infrastructure/firebase/config';

export default function BannedPage() {
  const { user, profile } = useAuth();
  const [appealMessage, setAppealMessage] = useState('');
  const [showAppeal, setShowAppeal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profile && !profile.ban?.isBanned && !profile.banned) {
      router.push('/home');
    }
  }, [profile, router]);

  const handleSubmitAppeal = async () => {
    if (!appealMessage.trim() || !user) return;

    setLoading(true);
    try {
      const appealId = `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await set(ref(db, `appeals/${appealId}`), {
        id: appealId,
        userId: user.uid,
        userName: profile?.name || user.displayName || 'User',
        userEmail: user.email || '',
        banType: profile?.ban?.banType || 'unknown',
        banReason: profile?.ban?.banReason || 'Violation of community guidelines',
        appealMessage: appealMessage.trim(),
        status: 'pending',
        timestamp: serverTimestamp(),
        createdAt: Date.now()
      });
      setSubmitted(true);
      setShowAppeal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit appeal');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await services.auth.signOut();
    router.push('/login');
  };

  const ban = profile?.ban;
  const isPermanent = ban?.isPermanent;
  const expiryDate = ban?.banExpiresAt ? new Date(ban.banExpiresAt) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] text-[#e0e0e0] p-4 md:p-8">
      <div className="w-full max-w-2xl bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 md:p-16 text-center space-y-8 bg-red-500/[0.02]">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-red-500/20 text-red-500 shadow-2xl shadow-red-500/10 animate-pulse">
            <Ban size={56} />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Account Restricted</h1>
            <p className="text-[#888] font-medium text-lg tracking-wide">Your access to the platform has been suspended.</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-red-400 justify-center">
              <AlertTriangle size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Reason for restriction</span>
            </div>
            <p className="text-sm text-red-200/80 font-bold italic leading-relaxed">
              &quot;{ban?.banReason || 'Violation of community guidelines and security protocols.'}&quot;
            </p>
            {ban?.isAutoBan && (
              <div className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Automated System Action
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-[#111] p-5 rounded-2xl border border-[#1f1f1f] flex flex-col items-center justify-center gap-3">
              <div className="text-[#444]">
                {isPermanent ? <Skull size={24} /> : <Clock size={24} />}
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-[#666] uppercase tracking-widest mb-1">Duration</div>
                <div className="text-xs font-black text-white uppercase tracking-widest">
                  {isPermanent ? 'Permanent' : 'Temporary'}
                </div>
              </div>
            </div>
            <div className="bg-[#111] p-5 rounded-2xl border border-[#1f1f1f] flex flex-col items-center justify-center gap-3">
              <div className="text-[#444]">
                <Ban size={24} />
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-[#666] uppercase tracking-widest mb-1">Status</div>
                <div className="text-xs font-black text-white uppercase tracking-widest">
                  {ban?.banType?.replace('_', ' ') || 'Restricted'}
                </div>
              </div>
            </div>
          </div>

          {expiryDate && (
            <div className="text-[11px] font-bold text-[#444] uppercase tracking-[0.3em]">
              Access will be restored on {expiryDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {!submitted && (
              <button 
                onClick={() => setShowAppeal(!showAppeal)}
                className="w-full sm:w-auto px-10 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-xl shadow-[#6366f1]/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <Gavel size={18} />
                {showAppeal ? 'Cancel Appeal' : 'Appeal Decision'}
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-red-500/10 text-[#444] hover:text-red-500 border border-[#1f1f1f] hover:border-red-500/30 text-xs font-black uppercase tracking-[0.2em] rounded-full transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {showAppeal && (
            <div className="space-y-6 pt-6 animate-in slide-in-from-top-4 duration-300">
              <div className="h-px bg-[#1f1f1f]" />
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#444] uppercase tracking-[0.3em]">Appeal Message</label>
                <textarea
                  value={appealMessage}
                  onChange={(e) => setAppealMessage(e.target.value)}
                  rows={4}
                  placeholder="Explain why you believe this restriction should be reviewed..."
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all resize-none font-medium placeholder-[#333]"
                />
              </div>
              <button 
                onClick={handleSubmitAppeal}
                disabled={loading || !appealMessage.trim()}
                className="w-full py-5 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-[0.3em] rounded-full transition-all shadow-xl shadow-green-500/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Processing...' : <><Send size={18} /> Submit Appeal</>}
              </button>
            </div>
          )}

          {submitted && (
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl animate-in zoom-in-95 duration-500">
              <div className="text-green-500 font-black text-xs uppercase tracking-[0.2em]">
                Appeal Submitted successfully. Our team will review your case.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
