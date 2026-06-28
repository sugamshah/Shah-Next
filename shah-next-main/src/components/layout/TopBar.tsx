'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { Search, ChevronDown, UserPlus, Inbox, MessageSquare, Radio, Edit, LogOut, IdCard, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/infrastructure/firebase/config';

export const TopBar: React.FC = () => {
  const { user, profile } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [lang, setLang] = useState('English');
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(localStorage.getItem('shah-lang') || 'English');
  }, []);

  useEffect(() => {
    if (!user) return;
    const notifRef = ref(db, `notifications/${user.uid}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const unread = Object.values(data).filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const dictionary: any = {
    'English': { search: 'Search...', profile: 'Edit Profile', public: 'My Public Profile', settings: 'Settings', logout: 'Logout', add: 'Add Friend', req: 'Requests', chat: 'Chats', broadcast: 'Broadcast' },
    'Hindi': { search: 'खोजें...', profile: 'प्रोफ़ाइल संपादित करें', public: 'मेरी सार्वजनिक प्रोफ़ाइल', settings: 'सेटिंग्स', logout: 'लॉगआउट', add: 'दोस्त जोड़ें', req: 'अनुरोध', chat: 'चैट', broadcast: 'ब्रॉडकास्ट' },
    'Spanish': { search: 'Buscar...', profile: 'Editar perfil', public: 'Mi perfil público', settings: 'Ajustes', logout: 'Cerrar sesión', add: 'Añadir amigo', req: 'Solicitudes', chat: 'Chats', broadcast: 'Difusión' },
    'French': { search: 'Rechercher...', profile: 'Modifier le profil', public: 'Mon profil public', settings: 'Paramètres', logout: 'Déconnexion', add: 'Ajouter un ami', req: 'Demandes', chat: 'Chats', broadcast: 'Diffusion' },
  };

  const d = dictionary[lang] || dictionary['English'];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    await services.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1f1f1f] px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight bg-gradient-to-br from-white to-[#6366f1] bg-clip-text text-transparent">
        SHAH
      </div>

      <div className="hidden md:flex items-center bg-[#141414] rounded-full px-4 py-2 gap-3 w-[300px] border border-transparent focus-within:border-[#6366f1]/30 transition-all">
        <Search size={18} className="text-[#888888]" />
        <input 
          type="text" 
          placeholder={d.search} 
          className="bg-transparent border-none outline-none text-sm w-full text-[#e0e0e0] placeholder-[#666]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Link 
          href="/notifications" 
          className="p-2 text-[#666] hover:text-[#6366f1] transition-all relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-[#6366f1] rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
              <span className="text-[8px] font-black text-white px-0.5">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </Link>

        <div className="relative">
        <div 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 bg-[#141414] hover:bg-[#1a1a1a] rounded-full pl-2 pr-4 py-1.5 cursor-pointer transition-all border border-[#1f1f1f]"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center font-bold text-white overflow-hidden shadow-lg shadow-[#6366f1]/20 relative">
              {profile?.photoURL ? (
                <Image src={profile.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                getInitials(profile?.name || user?.displayName || 'User')
              )}
            </div>
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 border-2 border-[#0a0a0a] rounded-full",
              profile?.status === 'online' ? 'bg-emerald-500' :
              profile?.status === 'away' ? 'bg-amber-500' :
              profile?.status === 'dnd' ? 'bg-rose-500' : 'bg-gray-500'
            )} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-[#e0e0e0] truncate max-w-[120px]">
              {profile?.name || user?.displayName || 'User'}
            </div>
            <div className="text-[10px] text-[#888888] truncate max-w-[120px]">
              {user?.email}
            </div>
          </div>
          <ChevronDown size={14} className="text-[#888888]" />
        </div>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute top-[calc(100%+12px)] right-0 w-[300px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] md:max-h-auto flex flex-col">
              <div className="p-4 bg-[#111111] border-b border-[#1f1f1f] shrink-0">
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center font-bold text-lg text-white overflow-hidden relative shadow-lg">
                    {profile?.photoURL ? (
                      <Image src={profile.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      getInitials(profile?.name || user?.displayName || 'User')
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#e0e0e0]">{profile?.name || user?.displayName || 'User'}</div>
                    <div className="text-xs text-[#888888]">{user?.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Online', value: 'online', color: 'bg-emerald-500' },
                    { label: 'Away', value: 'away', color: 'bg-amber-500' },
                    { label: 'DND', value: 'dnd', color: 'bg-rose-500' },
                    { label: 'Invisible', value: 'invisible', color: 'bg-gray-500' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        services.user.updateUserStatus(user!.uid, s.value as any);
                        setShowDropdown(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                        profile?.status === s.value 
                          ? "bg-[#1f1f1f] border-[#6366f1] text-white" 
                          : "bg-[#141414] border-transparent text-[#666] hover:bg-[#1a1a1a]"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", s.color)} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-2 space-y-1 overflow-y-auto">
                <Link href="/add-friend" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <UserPlus size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.add}</span>
                </Link>
                <Link href="/requests" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <Inbox size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.req}</span>
                </Link>
                <Link href="/chat" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <MessageSquare size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.chat}</span>
                </Link>
                <Link href="/broadcast" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <Radio size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.broadcast}</span>
                </Link>
                <Link href="/profile/edit" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <Edit size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.profile}</span>
                </Link>
                <Link href="/profile/search" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <IdCard size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.public}</span>
                </Link>
                <Link href="/settings" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] rounded-xl transition-all text-[#e0e0e0]">
                  <Settings size={18} className="text-[#888888]" />
                  <span className="text-sm font-medium">{d.settings}</span>
                </Link>
                <div className="h-px bg-[#1f1f1f] my-2 mx-3" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-400 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">{d.logout}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </nav>
  );
};
