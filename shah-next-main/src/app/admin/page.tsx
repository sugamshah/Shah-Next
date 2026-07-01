'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/infrastructure/firebase/AdminService';
import { services } from '@/services/container';
import { useToast } from '@/hooks/useToast';
import {
  LayoutDashboard,
  Users,
  Flag,
  Ban,
  LogOut,
  Shield,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { error: showError, info: showInfo } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ users: 0, groups: 0, broadcasts: 0, reports: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Check if user is admin
    const verifyAdmin = async () => {
      try {
        const admin = await adminService.isAdmin(user.uid);
        if (!admin) {
          showError('You do not have admin access.');
          router.push('/home');
          return;
        }
        setIsAdmin(true);
        await adminService.logAdminLogin(user.uid, true);
      } catch (err) {
        console.error('Error verifying admin:', err);
        showError('Failed to verify admin status.');
        router.push('/home');
      } finally {
        setAdminLoading(false);
      }
    };

    verifyAdmin();
  }, [user, loading, router, showError]);

  useEffect(() => {
    if (!isAdmin) return;

    // Listen to stats
    const unsubStats = adminService.getRealTimeStats((stats) => {
      setStats(stats);
    });

    // Listen to reports
    const unsubReports = adminService.getRecentReports((reports) => {
      setRecentReports(reports.slice(0, 10));
    });

    return () => {
      unsubStats.then((unsub) => unsub());
      unsubReports.then((unsub) => unsub());
    };
  }, [isAdmin]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: true },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Flag, label: 'Reports', href: '/admin/reports' },
    { icon: Ban, label: 'Bans', href: '/admin/bans' },
    { icon: Shield, label: 'Security', href: '/admin/security' },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#e0e0e0]">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-[#6366f1]" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <button
          onClick={async () => {
            await services.auth.signOut();
            router.push('/home');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] p-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  item.active
                    ? 'bg-[#6366f1] text-white'
                    : 'text-[#888888] hover:bg-[#1f1f1f] hover:text-white'
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Grid */}
            <section>
              <h2 className="text-2xl font-bold mb-6">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#888888] text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.users}</p>
                    </div>
                    <Users size={32} className="text-[#6366f1] opacity-50" />
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#888888] text-sm font-medium">Groups</p>
                      <p className="text-3xl font-bold mt-2">{stats.groups}</p>
                    </div>
                    <MessageSquare size={32} className="text-[#6366f1] opacity-50" />
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#888888] text-sm font-medium">Broadcasts</p>
                      <p className="text-3xl font-bold mt-2">{stats.broadcasts}</p>
                    </div>
                    <Radio size={32} className="text-[#6366f1] opacity-50" />
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#888888] text-sm font-medium">Pending Reports</p>
                      <p className="text-3xl font-bold mt-2">{stats.reports}</p>
                    </div>
                    <Flag size={32} className="text-red-500 opacity-50" />
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Reports */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Reports</h2>
                <Link
                  href="/admin/reports"
                  className="text-[#6366f1] hover:text-[#7c3aed] text-sm font-semibold"
                >
                  View All →
                </Link>
              </div>
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1f1f1f]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                          Report ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.length > 0 ? (
                        recentReports.map((report) => (
                          <tr key={report.id} className="border-b border-[#1f1f1f] hover:bg-[#111111] transition-all">
                            <td className="px-6 py-4 text-sm font-mono text-[#6366f1]">
                              {report.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-sm capitalize text-[#e0e0e0]">
                              {report.type || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={cn(
                                  'px-3 py-1 rounded-full text-xs font-semibold',
                                  report.verdict?.verdict === 'approved'
                                    ? 'bg-emerald-950 text-emerald-200'
                                    : report.verdict?.verdict === 'rejected'
                                    ? 'bg-red-950 text-red-200'
                                    : 'bg-amber-950 text-amber-200'
                                )}
                              >
                                {report.verdict?.verdict || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#888888]">
                              {new Date(report.timestamp).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-[#888888]">
                            No reports yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
