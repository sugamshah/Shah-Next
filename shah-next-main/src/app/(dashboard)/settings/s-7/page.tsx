'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Shield, 
  Cpu, 
  Globe, 
  Key, 
  Terminal, 
  ListTree,
  ArrowLeft,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function S7SettingsPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-[#6366f1] border border-[#1f1f1f]"
            >
              <ArrowLeft size={14} /> Back to Settings
            </button>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase leading-none">
              Module <span className="text-[#6366f1]">S-7</span>
            </h1>
            <p className="text-[#444] text-xs font-black uppercase tracking-[0.4em]">Next-Generation Communication Protocol</p>
          </div>
          
          <div className="flex items-center gap-8 bg-[#0a0a0a] p-6 rounded-3xl border border-[#1f1f1f] shadow-2xl">
            <div className="text-center">
              <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">Grid Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-sm font-black text-white uppercase italic">Optimal</span>
              </div>
            </div>
            <div className="w-px h-10 bg-[#1f1f1f]" />
            <div className="text-center">
              <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-1">Latency</div>
              <span className="text-sm font-black text-[#6366f1] uppercase italic">1.2ms</span>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative group cursor-pointer overflow-hidden rounded-[3rem] border border-[#1f1f1f] bg-black p-10 md:p-16">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6366f1] opacity-[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-[#6366f1] flex items-center justify-center text-white shadow-2xl shadow-[#6366f1]/20 rotate-3 group-hover:rotate-6 transition-all duration-500">
               <Zap size={64} className="md:size-80" />
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">
                System <span className="text-[#6366f1]">Control</span> Center
              </h2>
              <p className="text-[#888] text-sm md:text-lg font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                You are currently in the administrative root of Module S-7. This core layer manages all global communication, traffic distribution, and encrypted neural networks.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="px-4 py-2 bg-[#111] rounded-full border border-[#1f1f1f] flex items-center gap-2">
                    <Activity size={14} className="text-[#6366f1]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">S-7 Online</span>
                 </div>
                 <div className="px-4 py-2 bg-[#111] rounded-full border border-[#1f1f1f] flex items-center gap-2">
                    <Activity size={14} className="text-[#6366f1]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">99.9% Uptime</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-[#1f1f1f] space-y-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black text-white uppercase tracking-[0.2em]">Live S-7 Feed</h3>
              <p className="text-[10px] text-[#6366f1] font-black uppercase tracking-[0.4em]">99.8% Sync Efficiency</p>
            </div>
            <div className="flex items-center gap-1.5 p-4 bg-black rounded-3xl border border-[#1f1f1f] shadow-inner">
               {[...Array(24)].map((_, i) => (
                 <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-10 rounded-full transition-all duration-700",
                    i < 18 ? "bg-[#22c55e] shadow-[0_0_8px_#22c55e]" : "bg-[#1f1f1f]"
                  )} 
                 />
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-[#1f1f1f]/50">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-[#6366f1] uppercase tracking-[0.3em]">Architectural Info</h4>
              <p className="text-xs text-[#888] font-medium leading-relaxed">
                SHAH S-7 is a distributed security tool developed by SHAH Communication Company. It utilizes zero-knowledge proofs for session validation 
                and polymorphic encryption to ensure that data remains inaccessible even in the event of local node compromise.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-[#6366f1] uppercase tracking-[0.3em]">Operational Scope</h4>
              <p className="text-xs text-[#888] font-medium leading-relaxed">
                Currently managing encrypted communications globally with a mean-time-to-recovery (MTTR) of less than 40ms. S-7 is used to protect 
                user identities, prevent sybil attacks, and maintain the integrity of the SHAH decentralized communication infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Grid Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'Security Core', 
              desc: 'Encrypted firewall and DDoS mitigation protocols', 
              icon: Shield, 
              color: '#ef4444', 
              path: '/settings/s-7/security' 
            },
            { 
              title: 'Network Grid', 
              desc: 'Global relay and communication topology', 
              icon: Globe, 
              color: '#22c55e', 
              path: '/settings/s-7/networks' 
            },
            { 
              title: 'Audit Logs', 
              desc: 'Platform activity and security event history', 
              icon: ListTree, 
              color: '#f59e0b', 
              path: '/settings/s-7/logs' 
            },
            { 
              title: 'Access Auth', 
              desc: 'Identity verification and token management', 
              icon: Key, 
              color: '#ec4899', 
              path: '/settings/s-7/auth' 
            },
            { 
              title: 'Core Terminal', 
              desc: 'Direct command access to the S-7 System', 
              icon: Terminal, 
              color: '#ffffff', 
              path: '/settings/s-7/terminal' 
            },
          ].map((item) => (
            <button 
              key={item.title}
              onClick={() => router.push(item.path)}
              className="group p-8 bg-[#0a0a0a] hover:bg-[#0f0f0f] rounded-[2.5rem] border border-[#1f1f1f] hover:border-[#6366f1]/30 transition-all duration-500 text-left relative overflow-hidden"
            >
              <div 
                className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" 
                style={{ backgroundColor: item.color }} 
              />
              <div className="flex items-center justify-between mb-8">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#1f1f1f] shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3"
                  style={{ color: item.color, backgroundColor: `${item.color}10` }}
                >
                  <item.icon size={28} />
                </div>
                <ChevronRight size={20} className="text-[#222] group-hover:text-[#6366f1] group-hover:translate-x-2 transition-all" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight italic uppercase mb-2">{item.title}</h3>
              <p className="text-[#444] text-[10px] font-black uppercase tracking-widest leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
