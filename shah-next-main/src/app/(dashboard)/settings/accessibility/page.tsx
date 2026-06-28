'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Eye, ArrowLeft, Type, Contrast } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AccessibilityPage() {
  const router = useRouter();
  const [scale, setScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const savedScale = localStorage.getItem('shah-text-scale');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedScale) setScale(Number(savedScale));
    
    const savedHC = localStorage.getItem('shah-high-contrast');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedHC === 'true') setHighContrast(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${(scale / 100) * 16}px`;
  }, [scale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const updateScale = (newScale: number) => {
    setScale(newScale);
    localStorage.setItem('shah-text-scale', newScale.toString());
  };

  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem('shah-high-contrast', newVal.toString());
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
            <Eye className="text-[#6366f1]" size={32} />
            Accessibility
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Personalize your visual usage</p>
        </header>

        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Type size={18} className="text-[#6366f1]" />
              Text Scaling
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {[80, 100, 120, 140].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateScale(s)}
                    className={cn(
                      "flex-1 py-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest",
                      scale === s 
                        ? "bg-[#6366f1] border-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20" 
                        : "bg-[#111] border-[#1f1f1f] text-[#444] hover:border-[#333]"
                    )}
                  >
                    {s}%
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-[#444] uppercase tracking-widest">
                <span>Small</span>
                <span className={cn(scale === 100 && "text-[#6366f1]")}>Default (100%)</span>
                <span>Large</span>
              </div>
            </div>
          </div>

          <button 
            onClick={toggleHighContrast}
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 flex items-center justify-between hover:border-[#6366f1]/30 transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center text-[#6366f1] border border-[#1f1f1f]">
                <Contrast size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">High Contrast</h3>
                <p className="text-[10px] text-[#444] font-medium leading-tight mt-1">Enhance UI visibility</p>
              </div>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full p-1 transition-all",
              highContrast ? "bg-[#6366f1]" : "bg-[#111]"
            )}>
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all",
                highContrast ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
