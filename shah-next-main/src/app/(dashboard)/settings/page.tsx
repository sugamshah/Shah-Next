'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { 
  Settings as SettingsIcon, Bell, Shield, Palette, Globe, Trash2, 
  User, Lock, Laptop, CreditCard, Mic2, MessageSquare, HelpCircle, 
  Terminal, ShieldCheck, Info, Monitor, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState('Dark');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const savedTheme = localStorage.getItem('shah-theme') || 'Dark';
    const savedLang = localStorage.getItem('shah-lang') || 'English';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    setLanguage(savedLang);
  }, []);

  const handleThemeChange = (t: string) => {
    setTheme(t);
    localStorage.setItem('shah-theme', t);
    // Logic to apply theme globally could be here or in layout
    window.location.reload(); 
  };

  const handleLangChange = (l: string) => {
    setLanguage(l);
    localStorage.setItem('shah-lang', l);
    window.location.reload();
  };

  const sections = [
    {
      title: 'User Settings',
      items: [
        { icon: User, label: 'My Account', desc: 'Manage your profile and handle', href: '/profile/edit' },
        { icon: Lock, label: 'Privacy & Safety', desc: 'Control who can see your activity', href: '/settings/privacy' },
        { icon: ShieldCheck, label: 'End-to-End Encryption', desc: 'Secure your communications', href: '/settings/encryption' },
        { icon: Laptop, label: 'Devices & Security', desc: 'Manage your devices and security', href: '/settings/security' },
        { icon: User, label: 'Manage Account', desc: 'Account deletion and management', href: '/settings/manage-account' },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Palette, label: 'Appearance', desc: 'Customize your theme and layout', href: '/settings/appearance' },
        { icon: Globe, label: 'Language', desc: 'Change the application language', href: '/settings/language' },
        { icon: Bell, label: 'Notifications', desc: 'Configure your alert preferences', href: '/settings/notifications' },
        { icon: Mic2, label: 'Voice & Video', desc: 'Input and output settings', href: '/settings/voice-video' },
        { icon: MessageSquare, label: 'Text & Images', desc: 'Media and link settings', href: '/settings/text-images' },
        { icon: Info, label: 'Accessibility', desc: 'Make SHAH easier to use', href: '/settings/accessibility' },
        { icon: Info, label: 'Streamer Mode', desc: 'Hide sensitive info while live', href: '/settings/streamer-mode' },
      ]
    },
    {
      title: 'Advanced Settings',
      items: [
        { icon: Terminal, label: 'Module S-7', desc: 'Direct system & security access', href: '/settings/s-7' },
        { icon: Info, label: 'Developer Mode', desc: 'Access advanced debugging tools', href: '/settings/developer-mode' },
        { icon: Info, label: 'Changelog', desc: 'See what is new in SHAH', href: '/settings/changelog' },
        { icon: HelpCircle, label: 'Support / Help', desc: 'Get assistance from the team', href: '/settings/support' },
      ]
    }
  ];

  const translations: any = {
    'English': { title: 'Settings', subtitle: 'Configure your SHAH experience' },
    'Hindi': { title: 'सेटिंग्स', subtitle: 'अपने SHAH अनुभव को कॉन्फ़िगर करें' },
    'Spanish': { title: 'Ajustes', subtitle: 'Configure su experiencia SHAH' },
    'French': { title: 'Paramètres', subtitle: 'Configurez votre expérience SHAH' },
  };

  const t = translations[language] || translations['English'];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-12">
        <header className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-[#1f1f1f] shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6366f1] to-[#7c3aed] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-[#6366f1]/20">
            <SettingsIcon size={40} />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{t.title}</h1>
            <p className="text-[#666] text-xs font-bold uppercase tracking-[0.3em] mt-2">{t.subtitle}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-[10px] font-black text-[#444] uppercase tracking-[0.4em] ml-6">{section.title}</h2>
              <div className="bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] overflow-hidden shadow-xl">
                {section.items.map((item, idx) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-6 hover:bg-[#111] transition-all group border-b border-[#1f1f1f]/50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center text-[#6366f1] border border-[#1f1f1f] group-hover:bg-[#1a1a1a] transition-all">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-[#444] font-medium">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#333] group-hover:text-[#6366f1] transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

