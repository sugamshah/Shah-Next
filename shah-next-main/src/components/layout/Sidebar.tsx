'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquare, Radio, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [lang, setLang] = useState('English');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(localStorage.getItem('shah-lang') || 'English');
  }, []);

  const dictionary: any = {
    'English': { home: 'Home', chats: 'Chats', broadcast: 'Broadcast', profile: 'Profile' },
    'Hindi': { home: 'मुख्य पृष्ठ', chats: 'चैट', broadcast: 'ब्रॉडकास्ट', profile: 'प्रोफ़ाइल' },
    'Spanish': { home: 'Inicio', chats: 'Chats', broadcast: 'Difusión', profile: 'Perfil' },
    'French': { home: 'Accueil', chats: 'Chats', broadcast: 'Diffusion', profile: 'Profil' },
  };

  const d = dictionary[lang] || dictionary['English'];

  const navItems = [
    { icon: Home, href: '/home', label: d.home },
    { icon: MessageSquare, href: '/chat', label: d.chats },
    { icon: Radio, href: '/broadcast', label: d.broadcast },
    { icon: User, href: '/profile', label: d.profile },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center w-[72px] bg-[#0a0a0a] border-r border-[#1f1f1f] py-6 gap-4 shrink-0 overflow-y-auto">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group relative",
            pathname === item.href 
              ? "bg-[#6366f1] text-white" 
              : "bg-[#141414] text-[#888888] hover:bg-[#1f1f1f] hover:text-white"
          )}
        >
          <item.icon size={22} />
          {pathname === item.href && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
          )}
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f1f1f] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
            {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
          </div>
        </Link>
      ))}

      <div className="w-8 h-0.5 bg-[#1f1f1f] my-2" />

      <Link
        href="/group/create"
        className="w-12 h-12 rounded-2xl bg-[#141414] text-[#6366f1] hover:bg-[#6366f1] hover:text-white flex items-center justify-center transition-all duration-200"
      >
        <Plus size={22} />
      </Link>
    </aside>
  );
};
