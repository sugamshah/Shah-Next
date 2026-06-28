'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Bell, ArrowLeft, MessageSquare, AtSign, Volume2, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    allMessages: true,
    mentionsOnly: false,
    sound: true,
    push: true,
    email: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    { id: 'allMessages', icon: MessageSquare, label: 'All Messages', desc: 'Receive alerts for every incoming message' },
    { id: 'mentionsOnly', icon: AtSign, label: 'Only Mentions', desc: 'Notify only when you are @tagged' },
    { id: 'sound', icon: Volume2, label: 'Alert Sounds', desc: 'Play sounds for incoming notifications' },
    { id: 'push', icon: Smartphone, label: 'Push Notifications', desc: 'Desktop and mobile push alerts' },
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
            <Bell className="text-[#6366f1]" size={32} />
            Notifications
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Manage your alert preferences</p>
        </header>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id as keyof typeof settings)}
              className="w-full p-8 flex items-center justify-between border-b border-[#1f1f1f]/50 last:border-0 hover:bg-[#111] transition-all group text-left"
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                  settings[opt.id as keyof typeof settings]
                    ? "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20" 
                    : "bg-[#111] text-[#444] border-[#1f1f1f]"
                )}>
                  <opt.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{opt.label}</h3>
                  <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-1">{opt.desc}</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-all duration-300",
                settings[opt.id as keyof typeof settings] ? "bg-[#6366f1]" : "bg-[#111] border border-[#1f1f1f]"
              )}>
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-all duration-300",
                  settings[opt.id as keyof typeof settings] ? "ml-6" : "ml-0"
                )} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
