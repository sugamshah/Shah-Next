'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { Search, ArrowRight, User as UserIcon, Globe, IdCard } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/domain/entities';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const ProfileCard = ({ user, isPublic = false }: { user: User, isPublic?: boolean }) => (
  <div className={cn(
    "bg-[#0a0a0a] border border-[#1f1f1f] rounded-3xl overflow-hidden shadow-xl",
    isPublic ? "border-[#6366f1]/20" : ""
  )}>
    <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isPublic ? <Globe size={18} className="text-[#6366f1]" /> : <IdCard size={18} className="text-[#6366f1]" />}
        <span className="text-sm font-bold text-white uppercase tracking-wider">
          {isPublic ? 'Public Profile' : 'My Profile'}
        </span>
      </div>
    </div>
    
    <div className="p-6 flex items-center gap-5">
      <div className="w-20 h-20 rounded-full bg-[#141414] border-2 border-[#1f1f1f] overflow-hidden relative shadow-lg shrink-0">
        {user.photoURL ? (
          <Image src={user.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#333]">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold text-white truncate">{user.name}</h3>
        <div className="flex items-center gap-2 text-[#888888] font-medium">
          <IdCard size={14} />
          <span className="text-sm truncate">{user.jgId}</span>
        </div>
        {user.handle && (
          <div className="text-[#6366f1] text-sm font-bold mt-1">
            {user.handle.startsWith('@') ? user.handle : `@${user.handle}`}
          </div>
        )}
      </div>
    </div>

    {isPublic && user.statusMessage && (
      <div className="px-6 pb-6 pt-2">
        <div className="bg-[#111111] p-4 rounded-2xl border border-[#1f1f1f]">
          <p className="text-[#e0e0e0] text-sm leading-relaxed italic italic">
            &ldquo;{user.statusMessage}&rdquo;
          </p>
        </div>
      </div>
    )}
  </div>
);

export default function PublicProfileSearchPage() {
  const { user: currentUser, profile: currentProfile } = useAuth();
  const router = useRouter();
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    
    setLoading(true);
    setError('');
    try {
      const user = await services.user.findUserByJgId(searchId.trim());
      if (user) {
        router.push(`/profile/${user.jgId}`);
      } else {
        setError('Profile not found. Please check the JG ID.');
        setSearchResult(null);
      }
    } catch (err) {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 px-6 py-3 bg-[#111111] border border-[#1f1f1f] rounded-full shrink-0">
            <IdCard size={20} className="text-[#6366f1]" />
            <span className="text-lg font-bold text-white">Public Profile</span>
          </div>
          {currentProfile && (
             <div className="flex items-center gap-3 px-6 py-3 bg-[#141414] border border-[#1f1f1f] rounded-full">
              <UserIcon size={18} className="text-[#888888]" />
              <span className="text-lg font-bold text-[#888888]">{currentProfile.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Search size={22} className="text-[#6366f1]" />
                <h2 className="text-xl font-bold text-white">Search Profile</h2>
              </div>
              
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="JG-XXXXXX"
                    className="w-full bg-[#111111] border border-[#1f1f1f] rounded-2xl px-5 py-4 text-white placeholder-[#444] focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/50 outline-none transition-all uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-bold px-6 rounded-2xl shadow-lg shadow-[#6366f1]/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowRight size={18} />
                      View
                    </>
                  )}
                </button>
              </form>
              
              {error && <p className="text-rose-500 text-sm font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}
            </div>

            {currentProfile && <ProfileCard user={currentProfile} />}
          </div>

          <div className="space-y-8">
            {searchResult ? (
              <ProfileCard user={searchResult} isPublic={true} />
            ) : (
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                <div className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center text-[#222]">
                  <Globe size={48} />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold text-white">No Public Profile selected</h3>
                  <p className="text-[#666] text-sm mt-2 font-medium">Search for a JG ID to view their public information here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
