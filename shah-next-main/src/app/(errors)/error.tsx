'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-4 text-[#e0e0e0]">
      <div className="max-w-lg rounded-[2rem] border border-[#1f1f1f] bg-[#0a0a0a] p-10 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">Unexpected Error</p>
        <h1 className="mt-4 text-3xl font-black">Something went wrong</h1>
        <p className="mt-3 text-sm text-[#888]">A recoverable client error occurred. Please retry or go back home.</p>
        <div className="mt-6 text-sm text-[#888]">If this keeps happening, please contact support at <a href="mailto:shah.support@gmail.com" className="text-[#6366f1] hover:underline">shah.support@gmail.com</a>.</div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => reset()} className="rounded-full bg-[#6366f1] px-4 py-3 font-semibold text-white">Retry</button>
          <Link href="/home" className="rounded-full border border-[#1f1f1f] px-4 py-3 font-semibold text-[#e0e0e0]">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
