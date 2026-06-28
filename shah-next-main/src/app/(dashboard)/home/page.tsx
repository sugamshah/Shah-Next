'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { Users, UserPlus, MessageSquare, Radio, ArrowRight, ChartLine, TrendingUp, Edit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Group, Broadcast } from '@/domain/entities';
import { S7Security } from '@/lib/security';

export default function HomePage() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState({ users: 0, groups: 0, broadcasts: 0 });
  const [health, setHealth] = useState(S7Security.getSystemHealth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setHealth(S7Security.getSystemHealth());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && profile && !profile.handle) {
      const handle = profile.name.replace(/\s/g, "").toLowerCase() + Math.floor(100 + Math.random() * 899);
      services.user.updateUserProfile(user.uid, { handle });
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;

    let unsubGroups: (() => void) | undefined;
    let unsubBroadcasts: (() => void) | undefined;

    const fetchData = async () => {
      try {
        const contactsCount = Object.keys(profile?.contacts || {}).length;
        
        unsubGroups = services.group.listenUserGroups(user.uid, (groups) => {
          setCounts(prev => ({ ...prev, groups: groups.length }));
        });

        unsubBroadcasts = services.broadcast.listenChannels(user.uid, (channels) => {
          setCounts(prev => ({ ...prev, broadcasts: channels.length }));
        });

        setCounts(prev => ({ ...prev, users: contactsCount }));
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    return () => {
      unsubGroups?.();
      unsubBroadcasts?.();
    };
  }, [user, profile]);

  const [lang, setLang] = useState('English');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(localStorage.getItem('shah-lang') || 'English');
  }, []);

  const dictionary: any = {
    'English': { welcome: 'Welcome back', subtitle: 'Connect, chat, and manage the platform', manageGroups: 'Manage Groups', groupsDesc: 'Moderate content', users: 'Users', usersDesc: 'Manage accounts', broadcast: 'Broadcast', broadcastDesc: 'Send announcements', systemStats: 'System Statistics', systemStatsDesc: 'Platform analytics & health', recentActivity: 'Recent Activity', viewAll: 'View all', noChats: 'No recent chats', activityOverview: 'Activity Overview' },
    'Hindi': { welcome: 'वापस स्वागत है', subtitle: 'जुड़ें, चैट करें और प्लेटफॉर्म का प्रबंधन करें', manageGroups: 'समूह प्रबंधित करें', groupsDesc: 'सामग्री को नियंत्रित करें', users: 'उपयोगकर्ता', usersDesc: 'खाते प्रबंधित करें', broadcast: 'ब्रॉडकास्ट', broadcastDesc: 'घोषणाएं भेजें', systemStats: 'सिस्टम सांख्यिकी', systemStatsDesc: 'प्लेटफॉर्म विश्लेषण और स्वास्थ्य', recentActivity: 'हाल की गतिविधि', viewAll: 'सभी देखें', noChats: 'कोई हालिया चैट नहीं', activityOverview: 'गतिविधि अवलोकन' },
    'Spanish': { welcome: 'Bienvenido de nuevo', subtitle: 'Conéctate, chatea y gestiona la plataforma', manageGroups: 'Gestionar grupos', groupsDesc: 'Moderar contenido', users: 'Usuarios', usersDesc: 'Gestionar cuentas', broadcast: 'Difusión', broadcastDesc: 'Enviar anuncios', systemStats: 'Estadísticas del sistema', systemStatsDesc: 'Análisis y salud de la plataforma', recentActivity: 'Actividad reciente', viewAll: 'Ver todo', noChats: 'Sin chats recientes', activityOverview: 'Resumen de actividad' },
    'French': { welcome: 'Bon retour', subtitle: 'Connectez-vous, discutez et gérez la plateforme', manageGroups: 'Gérer les groupes', groupsDesc: 'Modérer le contenu', users: 'Utilisateurs', usersDesc: 'Gérer les comptes', broadcast: 'Diffusion', broadcastDesc: 'Envoyer des annonces', systemStats: 'Statistiques du système', systemStatsDesc: 'Analyses et santé de la plateforme', recentActivity: 'Activité récente', viewAll: 'Voir tout', noChats: 'Pas de chats récents', activityOverview: "Aperçu de l'activité" },
  };

  const d = dictionary[lang] || dictionary['English'];

  const quickActions = [
    { 
      id: 'groups', 
      title: d.manageGroups, 
      desc: d.groupsDesc, 
      icon: MessageSquare, 
      href: '/group',
      color: 'bg-indigo-500/20 text-indigo-500'
    },
    { 
      id: 'users', 
      title: d.users, 
      desc: d.usersDesc, 
      icon: Users, 
      href: '/add-friend',
      color: 'bg-purple-500/20 text-purple-500'
    },
    { 
      id: 'broadcast', 
      title: d.broadcast, 
      desc: d.broadcastDesc, 
      icon: Radio, 
      href: '/broadcast',
      color: 'bg-blue-500/20 text-blue-500'
    },
  ];

  const stats = [
    { label: d.users, value: counts.users, icon: Users },
    { label: d.manageGroups, value: counts.groups, icon: TrendingUp },
    { label: d.broadcast, value: counts.broadcasts, icon: Radio },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {d.welcome}, <span className="text-[#6366f1]">{profile?.name || 'User'}</span>
          </h1>
          <p className="text-[#888888] text-lg font-medium">{d.subtitle}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-[#1f1f1f] flex flex-col justify-center items-center text-center space-y-6 group hover:border-[#6366f1]/20 transition-all">
             <div className="w-20 h-20 bg-[#6366f1]/5 rounded-3xl flex items-center justify-center text-[#6366f1] border border-[#6366f1]/10 group-hover:scale-110 transition-transform">
               <ChartLine size={40} />
             </div>
             <div>
               <h3 className="font-black text-white uppercase tracking-[0.3em] text-sm">{d.systemStats}</h3>
               <p className="text-[#666] text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">{d.systemStatsDesc}</p>
             </div>
          </div>

          <div className="space-y-4">
            {quickActions.map((action) => (
              <Link 
                key={action.id} 
                href={action.href}
                className="group bg-[#0a0a0a] p-6 rounded-2xl border border-[#1f1f1f] flex items-center justify-between transition-all hover:bg-[#111111] hover:border-[#6366f1]/30 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", action.color)}>
                    <action.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{action.title}</h3>
                    <p className="text-[#888888] text-sm font-medium">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-[#333] group-hover:text-[#6366f1] transition-all transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-[#6366f1]" />
              <h3 className="text-xl font-bold text-white">{d.recentActivity}</h3>
            </div>
            <Link href="/chat" className="text-sm font-bold text-[#6366f1] hover:underline">
              {d.viewAll}
            </Link>
          </div>
          
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#1f1f1f] min-h-[160px] flex flex-col items-center justify-center p-8 text-center space-y-2">
            <p className="text-[#e0e0e0] font-bold text-lg">{d.noChats}</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-[#6366f1]" />
              <h3 className="text-xl font-bold text-white">{d.activityOverview}</h3>
            </div>
            <button className="p-2 text-[#333] hover:text-[#6366f1] transition-colors">
              <Edit size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1f1f1f] flex items-center gap-5 group hover:bg-[#111111] transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[#141414] flex items-center justify-center text-[#6366f1]">
                  <stat.icon size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-sm font-bold text-[#666]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
