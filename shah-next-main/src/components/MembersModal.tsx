'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, LogOut, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Member {
  uid: string;
  name: string;
  photoURL?: string;
  jgId: string;
  status?: string;
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  type: 'group' | 'broadcast';
  isAdmin: boolean;
  members: Member[];
  onMemberRemoved?: () => void;
}

export const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  entityId,
  type,
  isAdmin,
  members,
  onMemberRemoved,
}) => {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleKickMember = async (memberUid: string) => {
    if (!user) return;

    try {
      if (type === 'group') {
        await services.group.leaveGroup(entityId, memberUid);
      } else {
        await services.broadcast.leaveChannel(entityId, memberUid);
      }
      showSuccess('Member removed successfully');
      setSelectedMember(null);
      onMemberRemoved?.();
    } catch (err) {
      console.error('Error removing member:', err);
      showError('Failed to remove member');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.jgId.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f]">
          <h2 className="text-xl font-bold">Members ({members.length})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1f1f1f] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#1f1f1f]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#6366f1] transition-all"
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length > 0 ? (
            <div className="space-y-2 p-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between p-3 bg-[#111111] hover:bg-[#1a1a1a] rounded-lg transition-all relative group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => {
                      router.push(`/profile/${member.jgId}`);
                      onClose();
                    }}>
                    <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center font-semibold text-white shrink-0 overflow-hidden border border-[#1f1f1f]">
                      {member.photoURL ? (
                        <Image
                          src={member.photoURL}
                          alt={member.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#e0e0e0] truncate">{member.name}</p>
                      <p className="text-[10px] text-[#888888] font-mono">{member.jgId}</p>
                    </div>

                    <div
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
                      )}
                    />
                  </div>

                  {isAdmin && member.uid !== user?.uid && (
                    <button
                      onClick={() => setSelectedMember(member.uid)}
                      className="p-2 hover:bg-[#2a2a2a] rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical size={16} className="text-[#888888]" />
                    </button>
                  )}

                  {/* Member Action Menu */}
                  {selectedMember === member.uid && isAdmin && member.uid !== user?.uid && (
                    <div className="absolute right-10 top-0 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden shadow-xl z-50">
                      <button
                        onClick={() => handleKickMember(member.uid)}
                        className="w-full px-4 py-2 text-red-300 hover:bg-[#1f1f1f] text-sm font-semibold flex items-center gap-2 transition-all"
                      >
                        <LogOut size={14} />
                        {type === 'group' ? 'Remove from Group' : 'Remove from Broadcast'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#888888]">
              No members found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f1f1f]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
