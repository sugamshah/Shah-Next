'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { Users, Search, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { Group } from '@/domain/entities';

export default function GroupListPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupAvatar, setNewGroupAvatar] = useState('👥');

  useEffect(() => {
    if (!user) return;
    
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsub = services.group.listenUserGroups(user.uid, (groupsList) => {
      setGroups(groupsList);
      setLoading(false);
      clearTimeout(timeout);
    });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [user]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    try {
      await services.group.createGroup({
        name: newGroupName,
        description: newGroupDesc,
        avatar: newGroupAvatar
      }, user.uid);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-[#1f1f1f] shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-[#6366f1]" />
              Groups
            </h1>
            <p className="text-[#888888] text-sm mt-1">Your realtime communities</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 bg-[#1a1a1a] hover:bg-[#272727] text-[#6366f1] rounded-2xl flex items-center justify-center transition-all border border-[#1f1f1f] active:scale-95 shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="bg-[#0a0a0a] rounded-3xl border border-[#1f1f1f] overflow-hidden">
          <div className="p-4 md:p-6 bg-[#0f0f0f] border-b border-[#1f1f1f]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups by name..."
                className="w-full bg-[#121212] border border-[#1f1f1f] rounded-full py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-[#6366f1] transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-[#1f1f1f] min-h-[400px]">
            {loading ? (
              <div className="p-20 text-center text-[#888888]">
                <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading groups...
              </div>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <Link 
                  key={group.id}
                  href={`/group/${group.id}`}
                  className="flex items-center justify-between p-5 md:p-6 hover:bg-[#111111] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#1e2937] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0 border border-[#2a2a2a]">
                      {group.avatar || '👥'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#e0e0e0] group-hover:text-white transition-colors truncate">{group.name}</h3>
                      <p className="text-xs text-[#666] line-clamp-1 mt-1 font-medium italic">{group.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="bg-[#1e2937] text-[#6366f1] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0 border border-[#6366f1]/20">
                    <User size={10} strokeWidth={3} />
                    {Object.keys(group.members || {}).length}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-20 text-center text-[#888888] space-y-6">
                <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto border border-[#1f1f1f] text-[#333]">
                  <Users size={40} />
                </div>
                <div className="max-w-xs mx-auto">
                  <p className="text-lg font-bold text-[#e0e0e0]">No Groups Yet</p>
                  <p className="text-sm mt-2">Create your first group to start chatting with multiple people</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-6 px-8 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-black rounded-full transition-all shadow-xl shadow-[#6366f1]/20"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-[#1f1f1f] flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Create New Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#444] hover:text-white transition-colors text-2xl font-light">×</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Coding Buddies"
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-[#6366f1] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Description</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  rows={3}
                  placeholder="What's this group about?"
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-[#6366f1] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Group Avatar (emoji)</label>
                <input
                  type="text"
                  value={newGroupAvatar}
                  onChange={(e) => setNewGroupAvatar(e.target.value)}
                  maxLength={2}
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl py-4 px-5 text-center text-3xl outline-none focus:border-[#6366f1] transition-all"
                />
              </div>
            </div>

            <div className="p-6 bg-[#0f0f0f] border-t border-[#1f1f1f] flex justify-end gap-4">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-8 py-3 text-xs font-black text-[#666] hover:text-white transition-colors uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup}
                className="px-8 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-black rounded-full transition-all shadow-xl shadow-[#6366f1]/20 uppercase tracking-widest"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
