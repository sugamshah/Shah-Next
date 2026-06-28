'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/infrastructure/firebase/AdminService';
import { services } from '@/services/container';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Ban, Search, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState(86400000); // 24 hours default

  useEffect(() => {
    if (!user) return;

    const verifyAdmin = async () => {
      const isAdmin = await adminService.isAdmin(user.uid);
      if (!isAdmin) {
        showError('Unauthorized access');
        router.push('/home');
      }
    };

    verifyAdmin();
  }, [user, router, showError]);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const allUsers = await services.user.getAllUsers();
        if (isMounted) {
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Failed to load users', error);
        if (isMounted) {
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBanUser = async (userId: string) => {
    if (!banReason.trim()) {
      showError('Please provide a ban reason');
      return;
    }

    try {
      await adminService.banUser(userId, banReason, banDuration);
      showSuccess(`User banned successfully for ${banReason}`);
      setShowBanModal(null);
      setBanReason('');
    } catch (err) {
      console.error('Error banning user:', err);
      showError('Failed to ban user');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.jgId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#e0e0e0]">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-[#1f1f1f] rounded-lg transition-all">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">User Management</h1>
      </header>

      {/* Search Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-6 py-4">
        <div className="max-w-7xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or JgId..."
            className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-[#6366f1] transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1f1f1f] bg-[#111111]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      JgId
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="border-b border-[#1f1f1f] hover:bg-[#111111] transition-all">
                        <td className="px-6 py-4 text-sm font-medium text-[#e0e0e0]">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-[#888888]">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-[#6366f1] font-mono">{u.jgId}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold',
                              u.status === 'online'
                                ? 'bg-emerald-950 text-emerald-200'
                                : 'bg-slate-950 text-slate-200'
                            )}
                          >
                            {u.status || 'Offline'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setShowBanModal(u.uid)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-950 hover:bg-red-900 text-red-200 rounded-lg transition-all text-xs font-semibold"
                          >
                            <Ban size={14} />
                            Ban
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Ban User</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Reason</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter ban reason..."
                  className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 outline-none focus:border-[#6366f1] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Duration</label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 outline-none focus:border-[#6366f1] transition-all"
                >
                  <option value={3600000}>1 Hour</option>
                  <option value={86400000}>24 Hours</option>
                  <option value={604800000}>7 Days</option>
                  <option value={2592000000}>30 Days</option>
                  <option value={0}>Permanent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowBanModal(null)}
                className="flex-1 px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBanUser(showBanModal)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
