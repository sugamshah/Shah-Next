'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { MessageSquare, Search, ArrowLeft, Plus, Camera, X, Eye, UserPlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Contact, Story } from '@/domain/entities';

export default function ChatListPage() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [selectedStoryUser, setSelectedStoryUser] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    const unsubChats = services.chat.listenChatList(user.uid, (chats) => {
      setConversations(chats.filter(c => c.friendUid !== 'undefined'));
      setLoading(false);
      clearTimeout(timeout);
    });

    const contactUids = profile?.contacts 
      ? Object.keys(profile.contacts).filter(uid => uid !== 'undefined') 
      : [];
    
    const fetchFriends = async () => {
      const friendsList: any[] = [];
      if (contactUids.length > 0) {
        for (const fUid of contactUids) {
          try {
            const fProfile = await services.user.getUserProfile(fUid);
            if (fProfile) friendsList.push(fProfile);
          } catch (err) {
            console.error(`Failed to fetch friend ${fUid}`, err);
          }
        }
      }
      setFriends(friendsList);
    };
    
    fetchFriends();

    const unsubStories = services.story.listenStories(user.uid, contactUids, (allStories) => {
      setStories(allStories);
    });

    return () => {
      unsubChats();
      unsubStories();
      clearTimeout(timeout);
    };
  }, [user, profile?.contacts]);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingStory(true);
    try {
      const url = await services.upload.uploadFile(file, `stories/${user.uid}/${Date.now()}`);
      await services.story.uploadStory({
        authorUid: user.uid,
        mediaUrl: url,
        type: 'image',
        isCloseFriendsOnly: false
      });
      setShowStoryModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingStory(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.friend?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.friend?.jgId?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFriends = friends.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase()) && 
    !conversations.some(c => c.friendUid === f.uid)
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Stories Section */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button 
              onClick={() => setShowStoryModal(true)}
              className="w-16 h-16 rounded-full border-2 border-dashed border-[#1f1f1f] flex items-center justify-center text-[#6366f1] bg-[#111111] hover:bg-[#1a1a1a] transition-all relative group"
            >
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6366f1] rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-white">
                <Plus size={12} strokeWidth={4} />
              </div>
            </button>
            <span className="text-[10px] font-bold text-[#888888]">Your story</span>
          </div>

          {stories.map((storyUser) => (
            <button 
              key={storyUser.uid}
              onClick={() => setSelectedStoryUser(storyUser)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#6366f1] via-[#7c3aed] to-[#d946ef] animate-gradient-xy">
                <div className="w-full h-full rounded-full border-2 border-[#0a0a0a] bg-[#141414] overflow-hidden relative">
                  {storyUser.photoUrl ? (
                    <Image src={storyUser.photoUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                      {storyUser.name[0]}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#e0e0e0] max-w-[64px] truncate">{storyUser.name}</span>
            </button>
          ))}
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl border border-[#1f1f1f] overflow-hidden shadow-xl">
          <div className="p-6 md:p-8 border-b border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <MessageSquare className="text-[#6366f1]" />
                Messages
              </h1>
              <p className="text-[#888888] text-sm mt-1">Your recent conversations</p>
            </div>
            <Link 
              href="/add-friend"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-[#6366f1]/20"
            >
              <UserPlus size={14} />
              Add Friend
            </Link>
          </div>

          <div className="p-4 md:p-6 bg-[#0f0f0f] border-b border-[#1f1f1f]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#121212] border border-[#1f1f1f] rounded-full py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#6366f1] transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-[#1f1f1f] max-h-[800px] overflow-y-auto">
            {loading ? (
              <div key="loading" className="p-20 text-center text-[#888888]">
                <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading conversations...
              </div>
            ) : (
              <div key="list-container">
                {/* Conversations */}
                {filteredConversations.length > 0 && (
                  <div key="section-convs" className="bg-[#0f0f0f]">
                    <div className="px-6 py-2 bg-[#111] text-[10px] font-black text-[#444] uppercase tracking-[0.3em]">Recent Conversations</div>
                    {filteredConversations.map((conv) => (
                      <Link 
                        key={`conv-${conv.friendUid}`}
                        href={`/chat/${conv.friendUid}`}
                        className="flex items-center justify-between p-4 md:p-6 hover:bg-[#111111] transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-full bg-[#1e2937] flex items-center justify-center font-bold text-[#6366f1] overflow-hidden group-hover:scale-105 transition-transform shrink-0 relative border-2 border-[#1f1f1f]">
                            {conv.friend?.photoURL ? (
                              <Image src={conv.friend.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              conv.friend?.name?.charAt(0).toUpperCase() || 'U'
                            )}
                            <div className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 border-2 border-[#0a0a0a] rounded-full",
                              conv.friend?.status === 'online' ? 'bg-emerald-500' :
                              conv.friend?.status === 'away' ? 'bg-amber-500' :
                              conv.friend?.status === 'dnd' ? 'bg-rose-500' : 'bg-gray-500'
                            )} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#e0e0e0] group-hover:text-white transition-colors truncate">{conv.friend?.name}</span>
                              {conv.unread > 0 && (
                                <span className="bg-[#6366f1] text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                                  {conv.unread}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[#666] truncate mt-0.5">
                              {conv.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-[#444] text-right">
                          {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* New Friends / Contacts not yet messaged */}
                {filteredFriends.length > 0 && (
                  <div key="section-friends" className="bg-[#0f0f0f]">
                    <div className="px-6 py-2 bg-[#111] text-[10px] font-black text-[#444] uppercase tracking-[0.3em]">Contacts</div>
                    {filteredFriends.map((friend) => (
                      <Link 
                        key={`friend-${friend.uid}`}
                        href={`/chat/${friend.uid}`}
                        className="flex items-center justify-between p-4 md:p-6 hover:bg-[#111111] transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-full bg-[#1e2937] flex items-center justify-center font-bold text-[#6366f1] overflow-hidden group-hover:scale-105 transition-transform shrink-0 relative border-2 border-[#1f1f1f]">
                            {friend.photoURL ? (
                              <Image src={friend.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              friend.name?.charAt(0).toUpperCase() || 'U'
                            )}
                            <div className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 border-2 border-[#0a0a0a] rounded-full",
                              friend.status === 'online' ? 'bg-emerald-500' :
                              friend.status === 'away' ? 'bg-amber-500' :
                              friend.status === 'dnd' ? 'bg-rose-500' : 'bg-gray-500'
                            )} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#e0e0e0] group-hover:text-white transition-colors truncate">{friend.name}</span>
                            <div className="text-[10px] text-[#444] mt-1 font-mono uppercase tracking-widest">{friend.jgId}</div>
                          </div>
                        </div>
                        <div className="text-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={20} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {filteredConversations.length === 0 && filteredFriends.length === 0 && (
                  <div key="section-empty" className="p-20 text-center text-[#888888] space-y-6">
                    <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto text-[#333] border border-[#1f1f1f]">
                      <MessageSquare size={40} />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <p className="font-bold text-[#e0e0e0] text-lg">No conversations yet</p>
                      <p className="text-sm mt-2">Start a chat with your friends or add new ones to get started</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-[#0a0a0a] border-t border-[#1f1f1f] text-center">
            <Link 
              href="/home"
              className="inline-flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Story Upload Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Create Story</h3>
              <button onClick={() => setShowStoryModal(false)} className="p-2 text-[#666] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-[#141414] rounded-full flex items-center justify-center mx-auto text-[#333]">
                <Camera size={40} />
              </div>
              <div>
                <p className="text-[#e0e0e0] font-bold text-lg">Share a photo</p>
                <p className="text-[#666] text-sm mt-1">Stories disappear after 24 hours.</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingStory}
                className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6366f1]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {uploadingStory ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={20} />
                    Select Image
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleStoryUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {selectedStoryUser && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#6366f1] overflow-hidden relative">
                {selectedStoryUser.photoUrl ? (
                  <Image src={selectedStoryUser.photoUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#141414] flex items-center justify-center font-bold text-white uppercase">
                    {selectedStoryUser.name[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{selectedStoryUser.name}</div>
                <div className="text-[10px] text-white/60">
                  {new Date(selectedStoryUser.storiesList[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedStoryUser(null)} className="p-2 text-white/60 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src={selectedStoryUser.storiesList[0].mediaUrl} 
                alt="Story" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Progress Bar (simplified) */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 h-1">
                <div className="flex-1 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Reply to story..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/40 outline-none focus:border-white/40"
            />
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
              <Eye size={20} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
