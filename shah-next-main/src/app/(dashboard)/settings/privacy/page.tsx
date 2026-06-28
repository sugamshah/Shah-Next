'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Lock, ArrowLeft, Eye, Shield, UserX, Ghost } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PrivacyPage() {
  const router = useRouter();

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLastSeen: false,
    readReceipts: true,
    stealthMode: false,
  });

  const toggle = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    { id: 'profilePublic', icon: Eye, label: 'Public Profile', desc: 'Allow others to find you by handle' },
    { id: 'showLastSeen', icon: Shield, label: 'Activity Status', desc: 'Show when you were last online' },
    { id: 'readReceipts', icon: Lock, label: 'Read Receipts', desc: 'Show when you have read messages' },
    { id: 'stealthMode', icon: Ghost, label: 'S-7 Stealth', desc: 'Maximum anonymity for node relay' },
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
            <Lock className="text-[#6366f1]" size={32} />
            Privacy & Safety
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Manage your digital footprint</p>
        </header>

        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id as keyof typeof privacy)}
                className="w-full p-8 flex items-center justify-between border-b border-[#1f1f1f]/50 last:border-0 hover:bg-[#111] transition-all group text-left"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                    privacy[opt.id as keyof typeof privacy]
                      ? "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20" 
                      : "bg-[#111] text-[#444] border-[#1f1f1f]"
                  )}>
                    <opt.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{opt.label}</h3>
                    <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-1">{opt.desc}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full p-1 transition-all duration-300",
                  privacy[opt.id as keyof typeof privacy] ? "bg-[#6366f1]" : "bg-[#111] border border-[#1f1f1f]"
                )}>
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all duration-300",
                    privacy[opt.id as keyof typeof privacy] ? "ml-6" : "ml-0"
                  )} />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-red-500/[0.02] border border-red-500/10 rounded-[2.5rem] p-8 flex items-center justify-between group hover:bg-red-500/[0.05] transition-all cursor-pointer">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                   <UserX size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-white text-base">Blocked Users</h3>
                   <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest mt-1">Manage restricted accounts</p>
                </div>
             </div>
             <button className="text-[10px] font-black text-red-500 uppercase tracking-widest px-6 py-2 bg-red-500/10 rounded-full border border-red-500/20">View List</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
