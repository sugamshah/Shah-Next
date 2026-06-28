'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MessageSquare, ArrowLeft, Image as ImageIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TextImagesPage() {
  const router = useRouter();

  const options = [
    { label: 'Auto-load Media', desc: 'Automatically load images and videos in chat', enabled: true },
    { label: 'Show Link Previews', desc: 'Display website metadata in chat', enabled: true },
    { label: 'Compact Mode', desc: 'Reduce message spacing for more content', enabled: false },
    { label: 'Animated Emoji', desc: 'Enable motion for custom server emoji', enabled: true },
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
            <MessageSquare className="text-[#6366f1]" size={32} />
            Text & Images
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Manage your content experience</p>
        </header>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-xl">
          {options.map((opt) => (
            <div key={opt.label} className="p-8 flex items-center justify-between border-b border-[#1f1f1f]/50 last:border-0 hover:bg-[#111] transition-all">
              <div>
                <h3 className="font-bold text-white text-base">{opt.label}</h3>
                <p className="text-[10px] text-[#444] font-medium leading-tight mt-1">{opt.desc}</p>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-all ${opt.enabled ? 'bg-[#6366f1]' : 'bg-[#111]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${opt.enabled ? 'ml-6' : 'ml-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
