'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { services } from '@/services/container';
import { useAuth } from '@/hooks/useAuth';

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageId = searchParams.get('messageId');
  const reportedUid = searchParams.get('reportedUid');
  const reportedName = searchParams.get('reportedName');
  const { user } = useAuth();
  
  const [reason, setReason] = useState('');
  const [reportType, setReportType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isUserReport = !!reportedUid;
  const isMessageReport = !!messageId;

  const reportTypeOptions = isUserReport ? [
    { value: 'user_harassment', label: 'Harassment or Bullying' },
    { value: 'user_spam', label: 'Spam' },
    { value: 'user_inappropriate', label: 'Inappropriate Content' },
    { value: 'user_impersonation', label: 'Impersonation' },
    { value: 'user_other', label: 'Other' },
  ] : [
    { value: 'message_spam', label: 'Spam' },
    { value: 'message_harassment', label: 'Harassment' },
    { value: 'message_inappropriate', label: 'Inappropriate Content' },
    { value: 'message_misinformation', label: 'Misinformation' },
    { value: 'message_other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!reason.trim() || !reportType || !user) return;
    
    setIsSubmitting(true);
    try {
      if (isUserReport) {
        await services.user.reportUser(reportedUid as string, user.uid, reason, reportType);
      } else if (isMessageReport) {
        await services.chat.reportMessage(messageId as string, user.uid, reason);
      }
      setSubmitted(true);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#1f1f1f] rounded-full transition-all text-[#6366f1]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Report {isUserReport ? 'User' : 'Message'}</h1>
      </div>

      {submitted ? (
        <div className="bg-[#18181b] border border-[#22c55e]/20 p-8 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-[#22c55e]/10 text-[#22c55e] rounded-full flex items-center justify-center mx-auto">
            <Send size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#22c55e]">Report Submitted</h2>
          <p className="text-sm text-[#888]">Thank you for reporting. Our team will review this shortly.</p>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-[#1f1f1f] p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 text-sm">
            <AlertTriangle size={20} className="shrink-0" />
            <p>
              {isUserReport ? (
                <>Reporting user: <span className="font-semibold">{reportedName}</span> (ID: <span className="font-mono text-[10px] bg-black/30 px-1 rounded">{reportedUid}</span>)</>
              ) : (
                <>Reporting message ID: <span className="font-mono text-[10px] bg-black/30 px-1 rounded">{messageId}</span></>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6366f1] uppercase tracking-widest ml-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-4 text-sm outline-none focus:border-[#6366f1] transition-all"
            >
              <option value="">Select a reason...</option>
              {reportTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6366f1] uppercase tracking-widest ml-1">Additional Details</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide any additional details that would help us understand the issue..."
              className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-4 text-sm outline-none focus:border-[#6366f1] transition-all min-h-[150px] resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || !reportType || isSubmitting}
            className="w-full bg-[#6366f1] text-white font-bold py-4 rounded-2xl hover:bg-[#4f46e5] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" /></div>}>
      <ReportContent />
    </Suspense>
  );
}
