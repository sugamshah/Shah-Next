'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { useRouter } from 'next/navigation';
import { Radio, Search, Plus, User, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import type { Broadcast } from '@/domain/entities';

export default function BroadcastListPage() {
  const { user, profile } = useAuth();
  const [channels, setChannels] = useState<Broadcast[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [avatar, setAvatar] = useState('📢');
  const [isOfficial, setIsOfficial] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsub = services.broadcast.listenChannels(user.uid, (list) => {
      setChannels(list);
      setLoading(false);
      clearTimeout(timeout);
    });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [user]);

  const parseJoinValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const urlMatch = trimmed.match(/broadcast\/join\/([^\/?#]+)/i);
    if (urlMatch) return urlMatch[1];
    const codeMatch = trimmed.match(/([^\/?#]+)$/);
    return codeMatch ? codeMatch[1] : trimmed;
  };

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    try {
      await services.broadcast.createChannel({
        name,
        description: desc,
        avatar,
        isOfficial
      }, user.uid);
      setShowCreateModal(false);
      setName('');
      setDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinChannel = () => {
    const code = parseJoinValue(joinInput);
    if (!code) {
      setJoinError('Please enter a valid broadcast link or code.');
      return;
    }
    setJoinError('');
    setShowJoinModal(false);
    setJoinInput('');
    router.push(`/broadcast/join/${encodeURIComponent(code)}?from=list`);
  };

  const filtered = channels.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-[#1f1f1f] shadow-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Radio className="text-[#6366f1]" />
              Broadcasts
            </h1>
            <p className="text-[#666] text-xs font-bold uppercase tracking-widest mt-1">Official announcements & updates</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="h-12 px-5 bg-[#1a1a1a] hover:bg-[#272727] text-[#a5b4fc] rounded-2xl flex items-center justify-center gap-2 border border-[#1f1f1f] transition-all shadow-lg active:scale-95"
            >
              <LinkIcon size={18} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Join</span>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-12 h-12 bg-[#1a1a1a] hover:bg-[#272727] text-[#6366f1] rounded-2xl flex items-center justify-center border border-[#1f1f1f] transition-all shadow-lg active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-3xl border border-[#1f1f1f] overflow-hidden">
          <div className="p-4 md:p-6 bg-[#0f0f0f] border-b border-[#1f1f1f]">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search channels..."
                className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-full py-4 pl-14 pr-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all font-medium"
              />
            </div>
          </div>

          <div className="divide-y divide-[#1f1f1f] min-h-[400px]">
            {loading ? (
              <div className="p-20 text-center text-[#444]">
                <div className="w-10 h-10 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <span className="font-black uppercase tracking-[0.2em] text-xs">Syncing channels...</span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((channel) => (
                <Link 
                  key={channel.id}
                  href={`/broadcast/${channel.id}`}
                  className="flex items-center justify-between p-6 hover:bg-[#111] transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#1e2937] flex items-center justify-center text-3xl shrink-0 border border-[#2a2a2a] group-hover:scale-105 transition-transform">
                      {channel.avatar || '📢'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white text-lg truncate">{channel.name}</h3>
                        {channel.isOfficial && (
                          <ShieldCheck size={16} className="text-[#6366f1] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#666] font-bold line-clamp-1 mt-1.5 italic">
                        {channel.description || 'Broadcast Channel'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1e2937] text-[#6366f1] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-[#6366f1]/10 shrink-0">
                    {channel.members?.[user?.uid || '']?.role === 'admin' ? 'Admin' : 'Member'}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-20 text-center space-y-8">
                <div className="w-24 h-24 bg-[#141414] rounded-[2rem] flex items-center justify-center mx-auto border border-[#1f1f1f] text-[#222]">
                  <Radio size={48} />
                </div>
                <div className="max-w-sm mx-auto">
                  <p className="text-xl font-black text-white uppercase tracking-tight">No Channels Found</p>
                  <p className="text-[#666] text-sm mt-3 font-medium">Join an existing broadcast or create your own to share updates with the community.</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-8 px-10 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-black rounded-full transition-all shadow-2xl shadow-[#6366f1]/20 uppercase tracking-[0.2em]"
                  >
                    Create Channel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-lg bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#1f1f1f] flex items-center justify-between bg-[#111]/50">
              <h2 className="text-xl font-black text-white uppercase tracking-[0.1em]">Join Broadcast</h2>
              <button onClick={() => setShowJoinModal(false)} className="text-[#444] hover:text-white transition-colors text-3xl font-light">×</button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.3em] ml-1">Broadcast URL or Code</label>
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  placeholder="Paste link or channel code"
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all font-bold"
                />
              </div>
              {joinError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {joinError}
                </div>
              )}
            </div>
            <div className="p-8 bg-[#0f0f0f] border-t border-[#1f1f1f] flex justify-end gap-6">
              <button 
                onClick={() => setShowJoinModal(false)}
                className="px-8 py-3 text-[10px] font-black text-[#666] hover:text-white transition-colors uppercase tracking-[0.3em]"
              >
                Cancel
              </button>
              <button 
                onClick={handleJoinChannel}
                className="px-10 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[10px] font-black rounded-full transition-all shadow-2xl shadow-[#6366f1]/20 uppercase tracking-[0.3em]"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-lg bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#1f1f1f] flex items-center justify-between bg-[#111]/50">
              <h2 className="text-xl font-black text-white uppercase tracking-[0.1em]">New Broadcast</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#444] hover:text-white transition-colors text-3xl font-light">×</button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.3em] ml-1">Channel Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., System Updates"
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.3em] ml-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Tell your subscribers what to expect..."
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all resize-none font-medium"
                />
              </div>
            </div>

            <div className="p-8 bg-[#0f0f0f] border-t border-[#1f1f1f] flex justify-end gap-6">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-8 py-3 text-[10px] font-black text-[#666] hover:text-white transition-colors uppercase tracking-[0.3em]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="px-10 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[10px] font-black rounded-full transition-all shadow-2xl shadow-[#6366f1]/20 uppercase tracking-[0.3em]"
              >
                Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
