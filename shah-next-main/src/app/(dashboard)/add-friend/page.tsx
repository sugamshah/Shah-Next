'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { UserPlus, IdCard, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AddFriendPage() {
  const { user, profile } = useAuth();
  const [jgId, setJgId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleSendRequest = async () => {
    if (!jgId.trim() || !user) {
      setMessage({ text: 'Please enter a JG ID', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const target = await services.user.findUserByJgId(jgId.trim());
      
      if (!target) {
        setMessage({ text: 'User not found', type: 'error' });
        return;
      }

      if (target.uid === user.uid) {
        setMessage({ text: 'You cannot add yourself', type: 'error' });
        return;
      }

      // Check if already friends
      if (profile?.contacts?.[target.uid]) {
        setMessage({ text: 'Already friends with this user', type: 'info' });
        return;
      }

      await services.user.sendRequest(user.uid, target);
      setMessage({ text: 'Friend request sent successfully!', type: 'success' });
      setJgId('');
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to send request', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xl bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 md:p-12 text-center border-b border-[#1f1f1f] bg-[#111]/30">
            <div className="w-20 h-20 bg-[#6366f1]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[#6366f1]/20">
              <UserPlus size={36} className="text-[#6366f1]" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Add Friend</h1>
            <p className="text-[#666] text-sm font-bold uppercase tracking-[0.2em] mt-3">Enter your friend&apos;s JG ID to connect</p>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {message && (
              <div className={cn(
                "p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center border animate-in fade-in zoom-in-95",
                message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                message.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                "bg-blue-500/10 border-blue-500/20 text-blue-500"
              )}>
                {message.text}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#444] uppercase tracking-[0.3em] ml-2">Friend&apos;s JG ID</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#6366f1] transition-colors">
                  <IdCard size={20} />
                </div>
                <input
                  type="text"
                  value={jgId}
                  onChange={(e) => setJgId(e.target.value)}
                  placeholder="e.g., alice123 or jg-4567"
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-[2rem] py-5 pl-16 pr-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all font-bold placeholder-[#333]"
                />
              </div>
            </div>

            <button 
              onClick={handleSendRequest}
              disabled={loading || !jgId.trim()}
              className="w-full py-5 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] transition-all shadow-2xl shadow-[#6366f1]/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Search size={18} />
                  <span>Send Request</span>
                </div>
              )}
            </button>
          </div>

          <div className="p-8 bg-[#0a0a0a] border-t border-[#1f1f1f] text-center">
            <Link 
              href="/home"
              className="inline-flex items-center gap-2 text-[#444] hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
