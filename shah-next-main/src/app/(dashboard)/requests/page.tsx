'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { UserPlus, Check, X, ArrowLeft, Inbox } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ref, onValue, set, remove, get, push } from 'firebase/database';
import { db } from '@/infrastructure/firebase/config';

export default function RequestsPage() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const requestRef = ref(db, `requests/${user.uid}`);
    const unsub = onValue(requestRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([senderUid, req]: [string, any]) => ({
        uid: senderUid,
        ...req
      }));
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRequests(list);
      setLoading(false);
      clearTimeout(timeout);
    }, (err) => {
      console.error('listenRequests error:', err);
      setLoading(false);
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [user]);

  const handleAccept = React.useCallback(async (senderUid: string, senderName: string, senderJgId: string) => {
    if (!user || !profile) return;

    const now = Date.now();
    try {
      // Add mutual contacts
      await set(ref(db, `users/${user.uid}/contacts/${senderUid}`), {
        uid: senderUid,
        name: senderName,
        jgId: senderJgId,
        addedAt: now
      });
      await set(ref(db, `users/${senderUid}/contacts/${user.uid}`), {
        uid: user.uid,
        name: profile.name,
        jgId: profile.jgId,
        addedAt: now
      });
      
      // Remove the request
      await remove(ref(db, `requests/${user.uid}/${senderUid}`));

      // Add notification to the person whose request was accepted
      const notifRef = push(ref(db, `notifications/${senderUid}`));
      await set(notifRef, {
        type: 'professional',
        title: 'Request Accepted',
        message: `${profile.name} (@${profile.handle || profile.jgId}) accepted your friend request.`,
        timestamp: Date.now(),
        read: false,
        link: `/chat/${user.uid}`,
        sender: {
          name: profile.name,
          photoURL: profile.photoURL || ''
        }
      });

      alert('Friend request accepted!');
    } catch (err) {
      console.error(err);
      alert('Failed to accept request');
    }
  }, [user, profile]);

  const handleDecline = async (senderUid: string) => {
    if (!user) return;
    try {
      await remove(ref(db, `requests/${user.uid}/${senderUid}`));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in fade-in duration-500">
          <div className="p-8 md:p-12 text-center border-b border-[#1f1f1f] bg-[#111]/30">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Inbox size={36} className="text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Requests</h1>
            <p className="text-[#666] text-xs font-black uppercase tracking-[0.3em] mt-3">Manage incoming connections</p>
          </div>

          <div className="p-4 md:p-8 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#444]">
                <div className="w-10 h-10 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mb-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retrieving requests...</span>
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div 
                    key={req.uid}
                    className="group bg-[#111] p-5 md:p-6 rounded-3xl border border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-[#6366f1]/30 transition-all hover:shadow-xl hover:shadow-[#6366f1]/5"
                  >
                    <div className="flex items-center gap-5 text-center sm:text-left">
                      <div className="w-14 h-14 rounded-full bg-[#1e2937] flex items-center justify-center font-black text-xl text-[#6366f1] group-hover:scale-105 transition-transform shrink-0 border border-[#2a2a2a]">
                        {req.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-white text-lg tracking-tight truncate">{req.senderName}</div>
                        <div className="text-[10px] font-mono text-[#666] bg-[#0c0c0c] px-3 py-1 rounded-full inline-block mt-2 tracking-widest border border-[#1a1a1a]">
                          {req.senderJgId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAccept(req.uid, req.senderName, req.senderJgId)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 shadow-lg shadow-green-500/20"
                      >
                        <Check size={16} strokeWidth={4} />
                        Accept
                      </button>
                      <button 
                        onClick={() => handleDecline(req.uid)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent hover:bg-red-500/10 text-[#444] hover:text-red-500 border border-[#1f1f1f] hover:border-red-500/30 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all active:scale-95"
                      >
                        <X size={16} strokeWidth={4} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-24 h-24 bg-[#141414] rounded-[2.5rem] flex items-center justify-center border border-[#1f1f1f] text-[#222]">
                  <Inbox size={48} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-white uppercase tracking-tight">Inbox Empty</p>
                  <p className="text-[#666] text-sm mt-3 font-medium uppercase tracking-[0.1em]">No pending friend requests</p>
                </div>
              </div>
            )}
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
