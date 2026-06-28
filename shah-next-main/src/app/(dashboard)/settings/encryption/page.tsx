'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ShieldAlert, ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

export default function EncryptionPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-10 h-[80vh] flex flex-col items-center justify-center space-y-8 text-center">
        <div className="w-32 h-32 bg-[#6366f1]/10 rounded-full flex items-center justify-center border border-[#6366f1]/20 animate-pulse">
          <ShieldAlert size={64} className="text-[#6366f1]" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">End-to-End Encryption</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-full">
            <Construction size={16} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Feature Coming Soon</span>
          </div>
        </div>

        <p className="max-w-md text-[#666] font-medium leading-relaxed">
          We are currently building a military-grade encryption protocol that will ensure only you and your recipients can read your messages. No one else, not even SHAH, can access them.
        </p>

        <Link 
          href="/settings"
          className="flex items-center gap-3 px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-2xl border border-[#1f1f1f] transition-all font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </Link>
      </div>
    </DashboardLayout>
  );
}
