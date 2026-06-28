'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Terminal, 
  ArrowLeft,
  Shield,
  Zap,
  Activity,
  Cpu,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function S7TerminalPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { text: 'S-7 SYSTEM v2.4.0 INITIALIZED...', type: 'system' },
    { text: 'SYSTEM STATUS: OPERATIONAL | HEALTH: 99.8%', type: 'system' },
    { text: 'READY FOR COMMANDS.', type: 'system' },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, { text: `> ${input}`, type: 'user' }]);
    
    setTimeout(() => {
      let response = '';
      if (cmd === 'help') {
        response = 'AVAILABLE MODULES: security, auth, status';
      } else if (cmd === 'status') {
        response = 'SYSTEM HEALTH: OPTIMAL | UPTIME: 142d 12h | LOAD: 1.2ms';
      } else if (cmd === 'clear') {
        setHistory([]);
        setInput('');
        return;
      } else {
        response = `COMMAND NOT RECOGNIZED: ${cmd}. TYPE 'HELP' FOR LIST.`;
      }
      setHistory(prev => [...prev, { text: response, type: 'system' }]);
    }, 200);

    setInput('');
  };

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
              Core <span className="text-[#6366f1]">Terminal</span>
            </h1>
            <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.3em]">Direct S-7 System Access</p>
          </div>
        </div>

        <div className="bg-black rounded-[2.5rem] border border-[#1f1f1f] overflow-hidden shadow-2xl relative">
          {/* Terminal Decor */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6366f1] to-transparent opacity-50" />
          
          <div className="p-4 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            <span className="ml-4 text-[10px] font-black text-[#333] uppercase tracking-widest">S-7 Bash Console</span>
          </div>

          <div className="h-[500px] overflow-y-auto p-8 font-mono text-sm custom-scrollbar bg-[#050505]">
            <div className="space-y-3">
              {history.map((line, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "animate-in fade-in slide-in-from-left-2 duration-300",
                    line.type === 'user' ? 'text-[#6366f1]' : 'text-[#888]'
                  )}
                >
                  {line.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          <form onSubmit={handleCommand} className="p-6 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center gap-4">
            <span className="text-[#6366f1] font-mono font-bold">{'>'}</span>
            <input 
              autoFocus
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="flex-1 bg-transparent text-white font-mono text-sm outline-none border-none placeholder-[#222]"
            />
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-black text-[#444] uppercase tracking-widest">Linked</span>
               </div>
               <div className="flex items-center gap-2">
                 <Lock size={12} className="text-[#6366f1]" />
                 <span className="text-[8px] font-black text-[#444] uppercase tracking-widest">Encrypted</span>
               </div>
            </div>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-[#1f1f1f] flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
              <Shield size={24} />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-widest mb-1">Root Permission</div>
              <div className="text-[10px] text-[#444] font-medium italic">Full Administrative Override Enabled</div>
            </div>
          </div>
          <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-[#1f1f1f] flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap size={24} />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-widest mb-1">Direct System IO</div>
              <div className="text-[10px] text-[#444] font-medium italic">Latency: 0.8ms (Operational)</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
