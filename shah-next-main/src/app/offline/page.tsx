'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-4 text-[#e0e0e0]">
      <div className="max-w-md rounded-[2rem] border border-[#1f1f1f] bg-[#0a0a0a] p-10 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6366f1]">Offline</p>
        <h1 className="mt-4 text-3xl font-black">You are offline</h1>
        <p className="mt-3 text-sm text-[#888]">Reconnect to continue using SHAH and sync your messages.</p>
        <Link href="/home" className="mt-8 inline-flex rounded-full bg-[#6366f1] px-4 py-3 font-semibold text-white">Try again</Link>
      </div>
    </div>
  );
}
