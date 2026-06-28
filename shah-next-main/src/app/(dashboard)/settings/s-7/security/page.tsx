'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Shield, 
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function S7SecurityPage() {
  const router = useRouter();
  const [stealthMode, setStealthMode] = useState(false);
  const [firewallLevel, setFirewallLevel] = useState('High');

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/settings/s-7')}
            className="p-3 hover:bg-[#1f1f1f] rounded-2xl transition-all text-[#6366f1] border border-[#1f1f1f]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Security <span className="text-[#6366f1]">Core</span>
            </h1>
            <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.3em]">System-Level Protection Layer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stealth Mode */}
          <div className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] space-y-6">
            <div className="flex items-center justify-between">
               <div className="w-14 h-14 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
                 {stealthMode ? <EyeOff size={24} /> : <Eye size={24} />}
               </div>
               <button 
                onClick={() => setStealthMode(!stealthMode)}
                className={cn(
                  "w-14 h-8 rounded-full p-1 transition-all duration-500",
                  stealthMode ? "bg-emerald-500/20" : "bg-[#1f1f1f]"
                )}
               >
                 <div className={cn(
                   "w-6 h-6 rounded-full transition-all duration-500",
                   stealthMode ? "bg-emerald-500 ml-6" : "bg-[#333] ml-0"
                 )} />
               </button>
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Stealth Mode</h3>
              <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mt-1">Mask node identifiers from global scans</p>
            </div>
            <div className="p-4 bg-[#111] rounded-2xl border border-[#1f1f1f] text-[10px] text-[#666] font-medium leading-relaxed italic">
              When enabled, your node footprint is encrypted using randomized hop relays, making tracing nearly impossible for standard protocols.
            </div>
          </div>

          {/* Firewall Control */}
          <div className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] space-y-6">
            <div className="flex items-center justify-between">
               <div className="w-14 h-14 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
                 <ShieldAlert size={24} />
               </div>
               <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10 italic">Strict</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">DDoS Shield</h3>
              <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mt-1">Traffic scrubbing and request filtering</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Standard', 'High', 'Maximum'].map((level) => (
                <button 
                  key={level}
                  onClick={() => setFirewallLevel(level)}
                  className={cn(
                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    firewallLevel === level ? "bg-[#6366f1] text-white" : "bg-[#111] text-[#444] hover:bg-[#1a1a1a]"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-10 bg-gradient-to-br from-[#0a0a0a] to-black rounded-[3rem] border border-[#1f1f1f] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Zap size={100} className="text-[#6366f1] opacity-[0.03]" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
             <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
               <ShieldCheck size={40} />
             </div>
             <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Integrity Verification <span className="text-[#6366f1]">Stream</span></h2>
                <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.2em] max-w-md">Real-time system checksum monitoring enabled across all active clusters.</p>
             </div>
             <div className="flex items-center gap-4 bg-[#111] p-4 rounded-3xl border border-[#1f1f1f]">
               <Activity size={20} className="text-[#6366f1]" />
               <div>
                  <div className="text-[8px] font-black text-[#444] uppercase tracking-widest">System Load</div>
                  <div className="text-sm font-black text-white italic">0.02%</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
