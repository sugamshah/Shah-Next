'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { HelpCircle, ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-[#6366f1] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
            <HelpCircle className="text-[#6366f1]" size={32} />
            Support / Help
          </h1>
          <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">We are here to assist</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 group hover:border-[#6366f1]/30 transition-all">
             <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center text-[#6366f1] border border-[#1f1f1f] group-hover:scale-110 transition-transform">
               <Mail size={32} />
             </div>
             <div>
               <h3 className="font-bold text-white text-lg">Email Support</h3>
               <p className="text-[10px] text-[#444] font-medium leading-tight mt-1 uppercase tracking-widest">shah.support@gmail.com</p>
             </div>
             <button className="w-full py-3 bg-[#111] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#444] hover:text-white border border-[#1f1f1f]">Send Ticket</button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 group hover:border-[#6366f1]/30 transition-all">
             <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center text-[#6366f1] border border-[#1f1f1f] group-hover:scale-110 transition-transform">
               <MessageSquare size={32} />
             </div>
             <div>
               <h3 className="font-bold text-white text-lg">Community Help</h3>
               <p className="text-[10px] text-[#444] font-medium leading-tight mt-1 uppercase tracking-widest">Join SHAH HQ</p>
             </div>
             <button className="w-full py-3 bg-[#6366f1] rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#6366f1]/20">Join Server</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
