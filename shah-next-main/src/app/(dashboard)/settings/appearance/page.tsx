'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Palette, ArrowLeft, Sun, Moon, Stars } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AppearancePage() {
  const router = useRouter();
  const [theme, setTheme] = useState('Dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('shah-theme') || 'Dark';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (t: string) => {
    setTheme(t);
    localStorage.setItem('shah-theme', t);
    // Apply theme
    document.documentElement.classList.remove('light-theme', 'cosmic-theme');
    if (t === 'Light') document.documentElement.classList.add('light-theme');
    if (t === 'Cosmic') document.documentElement.classList.add('cosmic-theme');
    // We don't necessarily need a reload if the layout handles it, 
    // but DashboardLayout does it on mount. 
    // For immediate effect:
  };

  const themes = [
    { name: 'Dark', icon: Moon, desc: 'Original midnight aesthetics', color: 'bg-black' },
    { name: 'Light', icon: Sun, desc: 'Clean high-contrast clarity', color: 'bg-white' },
    { name: 'Cosmic', icon: Stars, desc: 'Vibrant interstellar gradients', color: 'bg-indigo-900' },
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
            <Palette className="text-[#6366f1]" size={32} />
            Appearance
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Customize your visual environment</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((tm) => (
            <button
              key={tm.name}
              onClick={() => handleThemeChange(tm.name)}
              className={cn(
                "p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center space-y-6 relative overflow-hidden group",
                theme === tm.name 
                  ? "bg-[#6366f1]/10 border-[#6366f1] shadow-2xl shadow-[#6366f1]/10" 
                  : "bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#333]"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 group-hover:rotate-3",
                theme === tm.name 
                  ? "bg-[#6366f1] text-white border-[#6366f1] shadow-lg shadow-[#6366f1]/20" 
                  : "bg-[#111] text-[#444] border-[#1f1f1f]"
              )}>
                <tm.icon size={32} />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-widest text-sm">{tm.name}</h3>
                <p className="text-[10px] text-[#444] font-bold uppercase tracking-tighter mt-2">{tm.desc}</p>
              </div>
              {theme === tm.name && (
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-pulse shadow-[0_0_8px_#6366f1]" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 space-y-8">
           <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Preview Architecture</h3>
           <div className={cn(
             "h-48 rounded-3xl border border-[#1f1f1f] p-8 flex flex-col justify-between transition-all duration-700",
             theme === 'Light' ? 'bg-white' : theme === 'Cosmic' ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-black'
           )}>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#6366f1] opacity-50" />
                 <div className="flex-1 space-y-2">
                    <div className={cn("h-3 w-32 rounded-full", theme === 'Light' ? 'bg-gray-200' : 'bg-white/10')} />
                    <div className={cn("h-2 w-48 rounded-full", theme === 'Light' ? 'bg-gray-100' : 'bg-white/5')} />
                 </div>
              </div>
              <div className={cn("h-10 w-full rounded-2xl border", theme === 'Light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10')} />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
