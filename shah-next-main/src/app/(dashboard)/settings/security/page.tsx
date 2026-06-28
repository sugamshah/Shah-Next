'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Laptop, ArrowLeft, ShieldCheck, Key, History, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const router = useRouter();

  const sessions = [
    { device: 'Desktop Chrome', location: 'Tokyo, Japan', status: 'Current Session', current: true },
    { device: 'iPhone 13 Pro', location: 'Osaka, Japan', status: 'Active 2h ago', current: false },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-[#6366f1] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
            <ShieldCheck className="text-[#6366f1]" size={32} />
            Devices & Security
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Protect your account and sessions</p>
        </header>

        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#6366f1]/5 flex items-center justify-center text-[#6366f1] border border-[#6366f1]/10">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Security Integrity</h3>
              <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                Your account is protected by SHAH&apos;s proprietary security layer. All sessions are encrypted end-to-end.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
