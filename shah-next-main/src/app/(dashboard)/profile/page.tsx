'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfileRedirectPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (profile?.jgId) {
        router.replace(`/profile/${profile.jgId}`);
      } else {
        // If no jgId, redirect to edit profile to set it up
        router.replace('/profile/edit');
      }
    }
  }, [profile, loading, router]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-72px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );
}
