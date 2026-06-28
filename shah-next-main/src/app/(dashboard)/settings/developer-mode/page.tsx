'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Terminal, ArrowLeft, Bug, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DeveloperModePage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shah-developer-mode');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'true') setEnabled(true);
  }, []);

  const toggleMode = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem('shah-developer-mode', newVal.toString());
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-[#6366f1] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
            <Terminal className="text-[#6366f1]" size={32} />
            Developer Mode
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Advanced debugging & integration</p>
        </header>

        <div className="space-y-6">
          <button 
            onClick={toggleMode}
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 flex items-center justify-between hover:border-[#6366f1]/30 transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center text-[#6366f1] border border-[#1f1f1f]">
                <Bug size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Debug Logging</h3>
                <p className="text-[10px] text-[#444] font-medium leading-tight mt-1">Verbose console output for S-7 protocols</p>
              </div>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full p-1 transition-all",
              enabled ? "bg-[#6366f1]" : "bg-[#111]"
            )}>
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all",
                enabled ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Database size={18} className="text-[#6366f1]" />
              API Environment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-[#6366f1] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#6366f1]/20">Production</button>
              <button className="p-4 bg-[#111] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#444] border border-[#1f1f1f]">Staging</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
