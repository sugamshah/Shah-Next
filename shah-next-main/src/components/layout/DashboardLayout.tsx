'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Home, MessageSquare, Radio, User as UserIcon, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Apply theme after component mounts to avoid hydration issues
    const applyTheme = () => {
      const html = document.documentElement;
      const savedTheme = localStorage.getItem('shah-theme') || 'Dark';
      
      // Remove all theme classes first
      html.classList.remove('light-theme', 'cosmic-theme');
      
      // Apply the selected theme
      if (savedTheme === 'Light') {
        html.classList.add('light-theme');
      } else if (savedTheme === 'Cosmic') {
        html.classList.add('cosmic-theme');
      }
    };

    applyTheme();

    // Apply accessibility settings
    const scale = localStorage.getItem('shah-text-scale');
    if (scale) {
      document.documentElement.style.fontSize = `${(Number(scale) / 100) * 16}px`;
    }
    
    if (localStorage.getItem('shah-high-contrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply streamer mode
    if (localStorage.getItem('shah-streamer-mode') === 'true') {
      document.documentElement.classList.add('streamer-mode');
    } else {
      document.documentElement.classList.remove('streamer-mode');
    }

    // Listen for storage changes (theme changes in other tabs)
    const handleStorageChange = () => {
      applyTheme();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { icon: Home, href: '/home', label: 'Home' },
    { icon: Bell, href: '/notifications', label: 'Inbox' },
    { icon: MessageSquare, href: '/chat', label: 'Chats' },
    { icon: Radio, href: '/broadcast', label: 'Broadcast' },
    { icon: UserIcon, href: '/profile', label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0c0c0c] text-[#e0e0e0]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-around z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === item.href ? "text-[#6366f1]" : "text-[#888888] opacity-60"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
