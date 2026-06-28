'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ListTree, 
  ArrowLeft,
  Search,
  Download,
  Trash2,
  Lock,
  Eye,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function S7LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([
    { id: '1', event: 'System Access', user: 'ADMIN', time: '10:42:01', status: 'Success', level: 'INFO' },
    { id: '2', event: 'DDoS Mitigation', user: 'SYSTEM', time: '10:45:22', status: 'Active', level: 'CRITICAL' },
    { id: '3', event: 'IP Blocked: 45.12.x.x', user: 'FIREWALL', time: '10:50:00', status: 'Flagged', level: 'WARN' },
    { id: '4', event: 'Cluster Gamma-9 Sync', user: 'SYS-MGR', time: '11:02:11', status: 'Success', level: 'INFO' },
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
              Audit <span className="text-[#6366f1]">Logs</span>
            </h1>
            <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.3em]">Encrypted System Activity Stream</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] overflow-hidden">
          <div className="p-8 border-b border-[#1f1f1f] flex flex-wrap items-center justify-between gap-4 bg-[#0c0c0c]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input 
                type="text" 
                placeholder="Search encrypted logs..." 
                className="w-full bg-[#111] border border-[#1f1f1f] rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:border-[#6366f1]"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#444] border border-[#1f1f1f]">
                <Download size={18} />
              </button>
              <button className="p-3 hover:bg-rose-500/10 rounded-xl transition-all text-rose-500 border border-rose-500/10">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#111] text-left">
                  <th className="p-6 text-[10px] font-black text-[#444] uppercase tracking-widest">Timestamp</th>
                  <th className="p-6 text-[10px] font-black text-[#444] uppercase tracking-widest">Event</th>
                  <th className="p-6 text-[10px] font-black text-[#444] uppercase tracking-widest">Level</th>
                  <th className="p-6 text-[10px] font-black text-[#444] uppercase tracking-widest">User/Source</th>
                  <th className="p-6 text-[10px] font-black text-[#444] uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#111] transition-colors">
                    <td className="p-6 text-[10px] font-mono text-[#666]">{log.time}</td>
                    <td className="p-6 text-sm font-bold text-white tracking-tight">{log.event}</td>
                    <td className="p-6">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                        log.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-500' : 
                        log.level === 'WARN' ? 'bg-amber-500/20 text-amber-500' : 'bg-[#6366f1]/20 text-[#6366f1]'
                      )}>
                        {log.level}
                      </span>
                    </td>
                    <td className="p-6 text-[10px] font-black text-[#444] uppercase tracking-widest">{log.user}</td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-[#e0e0e0]">
                        <div className={cn("w-1.5 h-1.5 rounded-full", log.status === 'Success' ? 'bg-emerald-500' : 'bg-[#6366f1]')} />
                        {log.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-[#0f0f0f] border-t border-[#1f1f1f] flex items-center justify-center gap-4">
            <Lock size={14} className="text-[#6366f1]" />
            <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Logs are end-to-end encrypted and purged every 24 hours</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
