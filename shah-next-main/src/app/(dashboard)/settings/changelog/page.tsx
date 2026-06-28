'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Info, ArrowLeft, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChangelogPage() {
  const router = useRouter();

  const releases = [
    { version: 'v1.4.2', date: 'June 26, 2026', changes: ['Improved Block User Logic', 'Fixed Photo Upload Stability', 'Enhanced S-7 Visual Interface', 'Refactored Settings Architecture'] },
    { version: 'v1.4.0', date: 'June 20, 2026', changes: ['Initial Beta Launch', 'Core S-7 System Integrated', 'End-to-End Encryption Implemented'] },
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
            <Zap className="text-[#6366f1]" size={32} />
            Changelog
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Latest platform updates</p>
        </header>

        <div className="space-y-10">
          {releases.map((rel) => (
            <div key={rel.version} className="relative pl-10 border-l border-[#1f1f1f] space-y-4">
              <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-[#6366f1] shadow-[0_0_10px_#6366f1]" />
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{rel.version}</h3>
                <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest">{rel.date}</p>
              </div>
              <ul className="space-y-2">
                {rel.changes.map((change, i) => (
                  <li key={i} className="text-sm text-[#888] flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-[#6366f1]" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
