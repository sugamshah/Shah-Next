'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/infrastructure/firebase/AdminService';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionText, setActionText] = useState('');

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
    const fetchReports = async () => {
      try {
        const unsubscribe = await adminService.getRecentReports((reports) => {
          setReports(reports);
          setLoading(false);
        });
        return unsubscribe;
      } catch (err) {
        console.error('Error fetching reports:', err);
        setLoading(false);
      }
    };

    const unsubPromise = fetchReports();
    return () => {
      unsubPromise.then((unsub) => unsub?.());
    };
  }, []);

  const handleApproveReport = async (reportId: string) => {
    try {
      await adminService.handleReportVerdict(reportId, 'approved', actionText || 'Action taken');
      showSuccess('Report approved and action taken');
      setSelectedReport(null);
      setActionText('');
    } catch (err) {
      console.error('Error approving report:', err);
      showError('Failed to approve report');
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      await adminService.handleReportVerdict(reportId, 'rejected', 'Report not valid');
      showSuccess('Report rejected');
      setSelectedReport(null);
      setActionText('');
    } catch (err) {
      console.error('Error rejecting report:', err);
      showError('Failed to reject report');
    }
  };

  const pendingReports = reports.filter((r) => !r.verdict);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#e0e0e0]">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-[#1f1f1f] rounded-lg transition-all">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Reports Management</h1>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-4">
              <p className="text-[#888888] text-sm">Total Reports</p>
              <p className="text-2xl font-bold mt-2">{reports.length}</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-4">
              <p className="text-[#888888] text-sm">Pending</p>
              <p className="text-2xl font-bold mt-2 text-amber-400">{pendingReports.length}</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-4">
              <p className="text-[#888888] text-sm">Handled</p>
              <p className="text-2xl font-bold mt-2 text-emerald-400">{reports.length - pendingReports.length}</p>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1f1f1f] bg-[#111111]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Report ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#888888]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#888888]">
                        Loading reports...
                      </td>
                    </tr>
                  ) : reports.length > 0 ? (
                    reports.map((report) => (
                      <tr key={report.id} className="border-b border-[#1f1f1f] hover:bg-[#111111] transition-all">
                        <td className="px-6 py-4 text-sm font-mono text-[#6366f1]">
                          {report.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm capitalize text-[#e0e0e0]">
                          {report.type || 'General'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#888888] max-w-xs truncate">
                          {report.description || 'No description'}
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
                        <td className="px-6 py-4 text-sm">
                          {!report.verdict && (
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="text-[#6366f1] hover:text-[#7c3aed] font-semibold"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#888888]">
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Report Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[#888888] mb-1">Report ID</label>
                <p className="text-[#e0e0e0] font-mono">{selectedReport.id}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#888888] mb-1">Type</label>
                <p className="text-[#e0e0e0] capitalize">{selectedReport.type || 'General'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#888888] mb-1">Description</label>
                <p className="text-[#e0e0e0] whitespace-pre-wrap">{selectedReport.description}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#888888] mb-1">Reporter</label>
                <p className="text-[#e0e0e0]">{selectedReport.reporterName || 'Anonymous'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#888888] mb-2">Action Notes</label>
                <textarea
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Document what action was taken..."
                  className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 outline-none focus:border-[#6366f1] transition-all resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-lg font-semibold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => handleRejectReport(selectedReport.id)}
                className="flex-1 px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <X size={18} />
                Reject
              </button>
              <button
                onClick={() => handleApproveReport(selectedReport.id)}
                className="flex-1 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
