'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Key, 
  ArrowLeft,
  Fingerprint,
  Smartphone,
  ShieldAlert,
  Lock,
  RefreshCcw,
  UserCheck,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function S7AuthPage() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = useState(true);

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
              Access <span className="text-[#6366f1]">Auth</span>
            </h1>
            <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.3em]">Identity Verification Cluster</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* MFA Section */}
            <div className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[#6366f1]/5 blur-[60px] rounded-full" />
               <div className="flex items-start justify-between mb-10 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] border border-[#6366f1]/20">
                      <Smartphone size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">Multi-Factor Auth</h2>
                      <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mt-1">S-7 Secure Verification</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={cn(
                    "w-14 h-8 rounded-full p-1 transition-all duration-500 relative",
                    mfaEnabled ? "bg-emerald-500/20" : "bg-[#1f1f1f]"
                  )}
                 >
                   <div className={cn(
                     "w-6 h-6 rounded-full transition-all duration-500 shadow-lg",
                     mfaEnabled ? "bg-emerald-500 ml-6" : "bg-[#333] ml-0"
                   )} />
                 </button>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="p-6 bg-[#111] rounded-2xl border border-[#1f1f1f] flex items-center justify-between group hover:border-[#6366f1]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <Fingerprint size={20} className="text-[#6366f1]" />
                      <div className="text-sm font-bold text-white uppercase tracking-tight">Biometric Override</div>
                    </div>
                    <span className="text-[8px] font-black text-[#444] uppercase tracking-widest px-2 py-1 bg-[#0a0a0a] rounded border border-[#1f1f1f]">Enabled</span>
                  </div>
                  <div className="p-6 bg-[#111] rounded-2xl border border-[#1f1f1f] flex items-center justify-between group hover:border-[#6366f1]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <ShieldAlert size={20} className="text-[#6366f1]" />
                      <div className="text-sm font-bold text-white uppercase tracking-tight">Security Keys (U2F)</div>
                    </div>
                    <button className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest hover:underline">Manage</button>
                  </div>
               </div>
            </div>

            {/* Session Management */}
            <div className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f]">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Active Sovereign Sessions</h3>
               <div className="space-y-4">
                 {[1, 2].map((i) => (
                    <div key={i} className="p-6 bg-[#0c0c0c] rounded-2xl border border-[#1f1f1f] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center text-[#6366f1] border border-[#1f1f1f]">
                          <Lock size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase tracking-tight">Node: Alpha-{i}19</div>
                          <div className="text-[10px] text-[#444] font-medium mt-0.5 uppercase tracking-widest italic">Berlin, Germany • Active Now</div>
                        </div>
                      </div>
                      <button className="p-2.5 hover:bg-rose-500/10 rounded-xl transition-all text-[#444] hover:text-rose-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                 ))}
               </div>
               <button className="w-full mt-6 py-4 bg-[#111] border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center justify-center gap-2 hover:bg-rose-500/5 transition-all">
                  Terminate All Other Sessions
               </button>
            </div>
          </div>

          <div className="space-y-6">
             <div className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-6 relative">
                  <Key size={40} />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center">
                    <UserCheck size={12} className="text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-black text-white tracking-tight uppercase">Admin Token</h4>
                <p className="text-[10px] font-black text-[#444] uppercase tracking-widest mt-2 mb-8 italic">Your core identity hash</p>
                
                <div className="w-full p-4 bg-[#111] rounded-2xl font-mono text-[10px] text-[#6366f1] break-all border border-[#1f1f1f]">
                  S7-HASH-88A2-X91L-P0Q9-ADMIN-KEY-2026
                </div>
                
                <button className="mt-6 w-full py-4 bg-[#6366f1] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6366f1]/20 hover:scale-[1.02] transition-all">
                  Rotate Admin Key
                </button>
             </div>

             <div className="p-8 bg-gradient-to-br from-[#111] to-black rounded-[2.5rem] border border-[#1f1f1f] flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Warning</div>
                   <div className="text-[10px] text-[#666] font-medium italic">Key rotation will invalidate all current node syncs. Proceed with extreme caution.</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
