'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LanguagePage() {
  const router = useRouter();
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const savedLang = localStorage.getItem('shah-lang') || 'English';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(savedLang);
  }, []);

  const handleLangChange = (l: string) => {
    setLanguage(l);
    localStorage.setItem('shah-lang', l);
    // In a real app, this would update an i18n context
    window.location.reload();
  };

  const languages = [
    { name: 'English', native: 'English', code: 'EN' },
    { name: 'Hindi', native: 'हिन्दी', code: 'HI' },
    { name: 'Spanish', native: 'Español', code: 'ES' },
    { name: 'French', native: 'Français', code: 'FR' },
    { name: 'German', native: 'Deutsch', code: 'DE' },
    { name: 'Japanese', native: '日本語', code: 'JP' },
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
            <Globe className="text-[#6366f1]" size={32} />
            Language
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Select your preferred interface language</p>
        </header>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => handleLangChange(lang.name)}
              className={cn(
                "w-full p-8 flex items-center justify-between transition-all border-b border-[#1f1f1f]/50 last:border-0 hover:bg-[#111] group",
                language === lang.name ? "bg-[#6366f1]/5" : ""
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all",
                  language === lang.name 
                    ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20" 
                    : "bg-[#111] text-[#444] border border-[#1f1f1f]"
                )}>
                  {lang.code}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-base">{lang.name}</h3>
                  <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-1">{lang.native}</p>
                </div>
              </div>
              {language === lang.name ? (
                <CheckCircle2 size={24} className="text-[#6366f1] animate-in zoom-in duration-300" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#1f1f1f] group-hover:border-[#333] transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
