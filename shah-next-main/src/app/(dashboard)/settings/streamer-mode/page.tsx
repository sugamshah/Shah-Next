'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Radio, ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function StreamerModePage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shah-streamer-mode');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'true') setEnabled(true);
  }, []);

  const toggleMode = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem('shah-streamer-mode', newVal.toString());
    if (newVal) {
      document.documentElement.classList.add('streamer-mode');
    } else {
      document.documentElement.classList.remove('streamer-mode');
    }
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
            <Radio className="text-[#6366f1]" size={32} />
            Streamer Mode
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Protect your privacy while live</p>
        </header>

        <div className="bg-gradient-to-br from-[#6366f1]/10 to-transparent border border-[#6366f1]/20 rounded-[2.5rem] p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Enable Streamer Mode</h3>
              <p className="text-[10px] text-[#888] font-bold uppercase tracking-widest leading-relaxed">
                Hides personal information like handles, JGIDs, and notification content.
              </p>
            </div>
            <button 
              onClick={toggleMode}
              className={cn(
                "w-16 h-8 rounded-full p-1 border transition-all",
                enabled ? "bg-[#6366f1] border-[#6366f1]" : "bg-[#111] border-[#1f1f1f]"
              )}
            >
               <div className={cn(
                 "w-6 h-6 bg-white rounded-full transition-all",
                 enabled ? "translate-x-8" : "translate-x-0"
               )} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1f1f1f]">
             <div className="flex items-center gap-3">
               <Shield size={16} className={cn(enabled ? "text-[#6366f1]" : "text-[#333]")} />
               <span className="text-[10px] font-bold text-[#444] uppercase">Hide Personal Info</span>
             </div>
             <div className="flex items-center gap-3">
               <Shield size={16} className={cn(enabled ? "text-[#6366f1]" : "text-[#333]")} />
               <span className="text-[10px] font-bold text-[#444] uppercase">Disable Sounds</span>
             </div>
             <div className="flex items-center gap-3">
               <Shield size={16} className={cn(enabled ? "text-[#6366f1]" : "text-[#333]")} />
               <span className="text-[10px] font-bold text-[#444] uppercase">Hide Handled Notifications</span>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
