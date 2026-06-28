'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { useToast } from '@/hooks/useToast';

export default function BroadcastJoinPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const code = Array.isArray(params.id) ? params.id[0] : params.id;
  const invalidCode = !code;
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [status, setStatus] = useState(invalidCode ? 'Invalid broadcast invite code.' : 'Joining broadcast...');
  const [attempted, setAttempted] = useState(invalidCode);

  useEffect(() => {
    if (loading || user) return;
    router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user || invalidCode) return;

    const join = async () => {
      try {
        const channelId = await services.broadcast.joinChannelByInviteCode(code.trim().toUpperCase(), user.uid);
        showSuccess('Successfully joined broadcast channel.');
        router.push(`/broadcast/${channelId}`);
      } catch (err: any) {
        console.error('Broadcast join error:', err);
        setStatus(err?.message || 'Unable to join broadcast at this time.');
        showError(err?.message || 'Unable to join broadcast.');
        setAttempted(true);
      }
    };

    join();
  }, [loading, user, invalidCode, code, router, showSuccess, showError]);

  return (
    <DashboardLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-[#1f1f1f] bg-[#0a0a0a] p-8 text-center shadow-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white">Broadcast Invite</h1>
            <p className="mt-3 text-sm text-[#888]">Join a broadcast channel by invite code.</p>
          </div>
          <div className="rounded-3xl border border-[#1f1f1f] bg-[#111] p-8 text-left">
            <p className="text-sm text-[#aaa]">Invite Code</p>
            <p className="mt-2 text-lg font-semibold text-white break-words">{code || '—'}</p>
            <div className="mt-6 text-sm text-[#ccc]">
              {attempted ? status : 'One moment while we connect you to the channel.'}
            </div>
          </div>
          {attempted && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push('/broadcast')}
                className="rounded-full bg-[#6366f1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4f46e5] transition-all"
              >
                Back to Broadcasts
              </button>
              <button
                onClick={() => router.push('/login')}
                className="rounded-full border border-[#1f1f1f] px-6 py-3 text-sm font-semibold text-[#e0e0e0] hover:border-[#6366f1] transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
