'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Bell, MessageSquare, AtSign, CheckCircle, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/infrastructure/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'mention' | 'professional' | 'system' | 'friend_request';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
  sender?: {
    name: string;
    photoURL?: string;
  };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const notifRef = ref(db, `notifications/${user.uid}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        })).sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(list);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    await update(ref(db, `notifications/${user.uid}/${id}`), { read: true });
  };

  const deleteNotif = async (id: string) => {
    if (!user) return;
    await remove(ref(db, `notifications/${user.uid}/${id}`));
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const updates: Record<string, any> = {};
    notifications.forEach(n => {
      if (!n.read) updates[`${n.id}/read`] = true;
    });
    if (Object.keys(updates).length > 0) {
      await update(ref(db, `notifications/${user.uid}`), updates);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention': return <AtSign size={18} className="text-[#6366f1]" />;
      case 'professional': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'friend_request': return <MessageSquare size={18} className="text-amber-500" />;
      default: return <Bell size={18} className="text-[#6366f1]" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
              <Bell className="text-[#6366f1]" size={32} />
              Inbox
            </h1>
            <p className="text-[#666] text-xs font-bold uppercase tracking-[0.2em]">Your mentions and alerts</p>
          </div>
          <div className="flex items-center gap-4">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-[#6366f1] hover:text-[#4f46e5] transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <CheckCircle size={14} />
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={() => notifications.forEach(n => deleteNotif(n.id))}
                className="text-[10px] font-bold text-[#666] hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Trash2 size={14} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">Scanning frequency...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2.5rem] p-20 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-[#111] rounded-3xl flex items-center justify-center text-[#222] border border-[#1f1f1f]">
              <Bell size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Frequency Clear</h3>
              <p className="text-xs text-[#666] max-w-xs font-medium leading-relaxed">
                No active notifications or mentions detected in your secure channel.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={cn(
                  "group relative bg-[#0a0a0a] border border-[#1f1f1f] rounded-3xl p-6 transition-all hover:bg-[#111] cursor-pointer overflow-hidden",
                  !notif.read && "border-l-4 border-l-[#6366f1]"
                )}
              >
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center border border-[#1f1f1f] group-hover:scale-110 transition-transform">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">{notif.title}</h4>
                      <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">
                        {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-[#888] font-medium leading-relaxed">{notif.message}</p>
                    
                    {notif.link && (
                      <Link 
                        href={notif.link}
                        className="inline-flex items-center gap-2 mt-4 text-[10px] font-black text-[#6366f1] uppercase tracking-widest hover:translate-x-1 transition-transform"
                      >
                        Navigate to Source
                        <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif(notif.id);
                  }}
                  className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
