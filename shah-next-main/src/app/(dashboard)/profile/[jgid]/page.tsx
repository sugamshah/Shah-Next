'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { ref, onValue } from 'firebase/database';
import { db } from '@/infrastructure/firebase/config';
import { 
  UserPlus, 
  ArrowLeft, 
  Globe, 
  Search, 
  AtSign, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Calendar,
  MessageCircle,
  Ban,
  Clock,
  Handshake
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from '@/domain/entities';

export default function PublicProfilePage() {
  const { user, profile: myProfile } = useAuth();
  const { jgid } = useParams();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!jgid) return;

    let unsubscribe: (() => void) | undefined;

    const fetchUser = async () => {
      setLoading(true);
      const u = await services.user.findUserByJgId(jgid as string);
      if (u) {
        // Now set up a real-time listener for this specific user
        const userRef = ref(db, `users/${u.uid}`);
        unsubscribe = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setTargetUser({ uid: u.uid, ...snapshot.val() });
          } else {
            setTargetUser(null);
          }
          setLoading(false);
        });
      } else {
        setTargetUser(null);
        setLoading(false);
      }
    };

    fetchUser();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [jgid]);

  const handleCopy = () => {
    if (!targetUser?.jgId) return;
    navigator.clipboard.writeText(targetUser.jgId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddConnection = async () => {
    if (!user || !targetUser) return;
    try {
      await services.user.sendRequest(user.uid, targetUser);
      alert(`Sent friend request to ${targetUser.name}!`);
    } catch (err) {
      console.error('Failed to send request:', err);
    }
  };

  const isFriend = myProfile?.contacts?.[targetUser?.uid || ''];
  const isSelf = targetUser?.uid === user?.uid;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-72px)] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-12 space-y-8">
        {/* Search Input - Minimal */}
        <div className="relative group animate-in fade-in slide-in-from-top-4 duration-500">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6366f1]" size={20} />
          <input
            type="text"
            placeholder="Search by JG ID..."
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-full py-5 pl-16 pr-8 text-white outline-none focus:border-[#6366f1] transition-all font-bold placeholder-[#333] shadow-2xl"
            onKeyPress={(e: any) => {
              if (e.key === 'Enter') router.push(`/profile/${e.target.value}`);
            }}
          />
        </div>

        {/* Profile Card */}
        <div className="w-full">
          {!targetUser ? (
            <div className="bg-[#0a0a0a] rounded-[3rem] border border-[#1f1f1f] p-20 text-center space-y-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-[#141414] rounded-3xl flex items-center justify-center mx-auto border border-[#1f1f1f] text-[#222]">
                <Search size={32} />
              </div>
              <p className="text-lg font-black text-white uppercase tracking-widest opacity-20">Profile not found</p>
            </div>
          ) : targetUser.banned ? (
            <div className="bg-[#0a0a0a] rounded-[3rem] border border-red-500/20 p-20 text-center space-y-6 animate-in zoom-in-95 duration-500 shadow-2xl shadow-red-500/5">
              <Ban size={64} className="mx-auto text-red-500/50" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Restricted</h2>
              <p className="text-[#666] text-xs uppercase tracking-widest">This account has been suspended.</p>
            </div>
          ) : (
            <div className="bg-[#0a0a0a] rounded-[3.5rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="p-12 md:p-16 space-y-12">
                {/* Identity Header */}
                <div className="flex flex-col items-center text-center gap-8">
                  <div className="w-40 h-40 rounded-full bg-[#1e2937] flex items-center justify-center border-4 border-[#111] shadow-2xl overflow-hidden relative group">
                    {targetUser.photoURL ? (
                      <Image src={targetUser.photoURL} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-6xl font-black text-[#6366f1]">{targetUser.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{targetUser.name}</h1>
                    <div className="flex items-center justify-center gap-2.5 text-[#6366f1] font-black uppercase tracking-[0.2em] text-xs">
                      <AtSign size={14} strokeWidth={3} />
                      <span>{targetUser.handle || 'no-handle'}</span>
                    </div>
                  </div>

                  <div className="bg-[#111] px-6 py-2.5 rounded-full border border-[#1f1f1f] flex items-center gap-4 group">
                    <QrCode size={16} className="text-[#6366f1]" />
                    <span className="text-[11px] font-mono text-[#888] tracking-[0.2em] uppercase font-bold">JG ID: {targetUser.jgId}</span>
                    <button onClick={handleCopy} className="text-[#444] hover:text-white transition-colors p-1">
                      {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-[#0c0c0c] p-10 rounded-[2.5rem] border border-[#1f1f1f] space-y-4 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#6366f1]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#333]">User Description</span>
                  <p className="text-base text-[#e0e0e0] font-medium leading-relaxed italic max-w-lg mx-auto">
                    &quot;{targetUser.statusMessage || 'This user prefers to keep their description a mystery.'}&quot;
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  {isSelf ? (
                    <Link 
                      href="/profile/edit"
                      className="w-full py-6 bg-[#111] hover:bg-[#151515] text-[#666] hover:text-white font-black text-sm uppercase tracking-[0.5em] rounded-full text-center transition-all border border-[#1f1f1f] block shadow-xl"
                    >
                      Edit Your Identity
                    </Link>
                  ) : isFriend ? (
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1 py-6 bg-green-500/5 text-green-500 font-black text-xs uppercase tracking-[0.4em] rounded-full border border-green-500/20 text-center flex items-center justify-center gap-3">
                        <CheckCircle2 size={20} />
                        Connected
                      </div>
                      <Link 
                        href={`/chat/${targetUser.uid}`}
                        className="flex-1 py-6 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-xs uppercase tracking-[0.4em] rounded-full text-center transition-all shadow-2xl shadow-[#6366f1]/30 active:scale-95"
                      >
                        Send Message
                      </Link>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddConnection}
                      className="w-full py-7 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-sm uppercase tracking-[0.6em] rounded-full transition-all shadow-2xl shadow-[#6366f1]/40 active:scale-[0.98] flex items-center justify-center gap-5"
                    >
                      <UserPlus size={24} strokeWidth={3} />
                      Send Friend Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
