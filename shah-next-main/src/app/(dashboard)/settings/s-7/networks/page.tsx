'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Globe, 
  ArrowLeft,
  Settings2,
  Signal,
  Wifi,
  Database,
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function S7NetworksPage() {
  const router = useRouter();
  const [networks] = useState([
    { name: 'Local Cluster', status: 'Connected', latency: '0.4ms', load: '12%', color: 'emerald' },
    { name: 'Global CDN Relay', status: 'Active', latency: '18ms', load: '45%', color: 'indigo' },
    { name: 'Onion Bridge', status: 'Standby', latency: '142ms', load: '2%', color: 'amber' },
    { name: 'Satellite Uplink', status: 'Offline', latency: 'N/A', load: '0%', color: 'rose' },
  ]);

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
              Network <span className="text-[#6366f1]">Grid</span>
            </h1>
            <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.3em]">Neural Communication Layer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {networks.map((net) => (
            <div key={net.name} className="p-8 bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] relative overflow-hidden group hover:border-[#6366f1]/50 transition-all duration-500">
               <div className={cn(
                 "absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity",
                 net.color === 'emerald' ? 'bg-emerald-500' : 
                 net.color === 'rose' ? 'bg-rose-500' : 
                 net.color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'
               )} />
               
               <div className="flex items-center justify-between mb-8">
                 <div className={cn(
                   "w-14 h-14 rounded-2xl flex items-center justify-center border border-[#1f1f1f] shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3",
                   net.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                   net.color === 'rose' ? 'bg-rose-500/10 text-rose-500' : 
                   net.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                 )}>
                   <Wifi size={24} />
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">Status</div>
                    <div className={cn(
                      "text-xs font-bold uppercase tracking-tight",
                      net.status === 'Connected' || net.status === 'Active' ? 'text-emerald-500' : 'text-[#444]'
                    )}>{net.status}</div>
                 </div>
               </div>

               <h3 className="text-xl font-black text-white tracking-tight mb-6">{net.name}</h3>

               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-[#0c0c0c] rounded-2xl border border-[#1f1f1f]">
                   <div className="text-[8px] font-black text-[#444] uppercase tracking-widest mb-1">Latency</div>
                   <div className="text-sm font-bold text-white font-mono">{net.latency}</div>
                 </div>
                 <div className="p-4 bg-[#0c0c0c] rounded-2xl border border-[#1f1f1f]">
                   <div className="text-[8px] font-black text-[#444] uppercase tracking-widest mb-1">Grid Load</div>
                   <div className="text-sm font-bold text-white font-mono">{net.load}</div>
                 </div>
               </div>
               
               <button className="w-full mt-6 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#1f1f1f] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#666] flex items-center justify-center gap-2 group/btn transition-all">
                 Configure Protocol <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </div>
          ))}
        </div>

        <div className="p-10 bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] space-y-8 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] bg-[#6366f1] flex items-center justify-center text-white shadow-2xl shadow-[#6366f1]/20">
                 <Globe size={32} />
               </div>
               <div>
                 <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">Neural Mesh <span className="text-[#6366f1]">Topology</span></h2>
                 <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">Active relays across 14 sovereign clusters</p>
               </div>
            </div>
            <div className="hidden md:flex gap-10">
              <div className="text-center">
                <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">Relays</div>
                <div className="text-xl font-black text-white italic tracking-tighter uppercase">Online</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">Uptime</div>
                <div className="text-xl font-black text-[#6366f1] italic tracking-tighter uppercase">99.9%</div>
              </div>
            </div>
          </div>
          
          <div className="h-64 bg-[#050505] rounded-[2rem] border border-[#1f1f1f] relative overflow-hidden">
             {/* Simple visual representation of a grid */}
             <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20">
               {Array.from({ length: 72 }).map((_, i) => (
                 <div key={i} className="border-[0.5px] border-[#1f1f1f]" />
               ))}
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-2 border-[#6366f1]/30 animate-ping absolute" />
                   <div className="w-24 h-24 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/50 flex items-center justify-center relative">
                     <div className="w-4 h-4 bg-[#6366f1] rounded-full shadow-[0_0_15px_#6366f1]" />
                   </div>
                </div>
             </div>
             <div className="absolute bottom-6 left-6 flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#111] rounded-full border border-[#1f1f1f]">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Encrypted</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#111] rounded-full border border-[#1f1f1f]">
                  <Zap size={12} className="text-amber-500" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Low Latency</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
