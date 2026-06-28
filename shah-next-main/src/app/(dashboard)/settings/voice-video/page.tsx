'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Mic2, ArrowLeft, Volume2, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VoiceVideoPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-[#6366f1] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
            <Mic2 className="text-[#6366f1]" size={32} />
            Voice & Video
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Multimedia communication settings</p>
        </header>

        <div className="space-y-8">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Volume2 size={18} className="text-[#6366f1]" />
              Input Device
            </h3>
            <select className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl p-4 text-sm text-white outline-none">
              <option>Default Microphone</option>
              <option>System Audio</option>
            </select>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Video size={18} className="text-[#6366f1]" />
              Video Settings
            </h3>
            <div className="aspect-video bg-[#111] rounded-3xl border border-[#1f1f1f] flex items-center justify-center relative overflow-hidden">
               <div className="text-[10px] font-black text-[#444] uppercase tracking-widest">Camera Preview Unavailable</div>
               <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-tighter border border-white/10">0.0.0.0 // S-7 Safe</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
