'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-4 text-[#e0e0e0]">
      <div className="max-w-md rounded-[2rem] border border-[#1f1f1f] bg-[#0a0a0a] p-10 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6366f1]">404</p>
        <h1 className="mt-4 text-3xl font-black">Page Not Found</h1>
        <p className="mt-3 text-sm text-[#888]">The page you requested is unavailable or may have moved.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/home" className="rounded-full bg-[#6366f1] px-4 py-3 font-semibold text-white">Go Home</Link>
          <Link href="/support" className="rounded-full border border-[#1f1f1f] px-4 py-3 font-semibold text-[#e0e0e0]">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
