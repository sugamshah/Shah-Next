'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { services } from '@/services/container';
import { MembersModal } from '@/components/MembersModal';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Radio,
  Users,
  Link as LinkIcon,
  Trash2,
  Eraser,
  LogOut,
  Edit,
  ShieldCheck,
  Pin,
  Reply,
  Flag,
  Smile,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Message, Broadcast } from '@/domain/entities';

export default function BroadcastChatPage() {
  const { user, profile } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const params = useParams();
  const channelId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [channel, setChannel] = useState<Broadcast | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState<Array<{ uid: string; name: string; photoURL?: string; jgId: string; status?: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!channelId || !user) return;

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const fetchChannel = async () => {
      try {
        const c = await services.broadcast.getChannel(channelId as string);
        setChannel(c);
      } catch (err) {
        console.error('Failed to fetch channel', err);
      }
    };

    fetchChannel();

    // Listen to messages
    const unsub = services.chat.listenMessages(`broadcast_${channelId}`, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [channelId, user]);

  useEffect(() => {
    let active = true;
    const loadMembers = async () => {
      if (!channel?.members) {
        setMembers([]);
        return;
      }

      const memberIds = Object.keys(channel.members);
      const loaded = await Promise.all(memberIds.map(async (uid) => {
        const userProfile = await services.user.getUserProfile(uid);
        return {
          uid,
          name: userProfile?.name || 'Unknown',
          photoURL: userProfile?.photoURL || undefined,
          jgId: userProfile?.jgId || uid,
          status: userProfile?.status || 'offline'
        };
      }));

      if (active) {
        setMembers(loaded);
      }
    };

    loadMembers();
    return () => {
      active = false;
    };
  }, [channel?.members]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const msgData: Partial<Message> = {
      text: inputText.trim(),
      sender: user.uid,
      senderName: profile?.name || user.displayName || 'User',
    };

    setInputText('');
    await services.broadcast.sendMessage(channelId as string, msgData);
  };

  const handleEdit = async () => {
    if (!editText.trim() || !isEditing) return;
    await services.chat.editMessage(`broadcast_${channelId}`, isEditing, editText.trim());
    setIsEditing(null);
    setEditText('');
    setSelectedMessage(null);
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!user) return;
    await services.chat.addReaction(`broadcast_${channelId}`, msgId, emoji, user.uid);
    setSelectedMessage(null);
  };

  const handleDelete = async (msgId: string) => {
    if (!user) return;
    await services.chat.deleteMessage(`broadcast_${channelId}`, msgId, true, user.uid);
    setSelectedMessage(null);
  };

  const handlePin = async (msgId: string) => {
    await services.chat.togglePinMessage(`broadcast_${channelId}`, msgId);
    setSelectedMessage(null);
  };

  const handleForward = async (friendUid: string) => {
    if (!selectedMessage || !user) return;
    
    const targetRoomId = [user.uid, friendUid].sort().join('_');
    const msgData: Partial<Message> = {
      text: selectedMessage.text,
      sender: user.uid,
      senderName: profile?.name || user.displayName || 'User',
      receiver: friendUid,
      forwarded: true
    };

    await services.chat.sendMessage(targetRoomId, msgData);
    setShowForwardModal(false);
    setSelectedMessage(null);
    showSuccess('Message forwarded!');
  };

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    if (!showForwardModal || !user) return;
    const unsub = services.chat.listenChatList(user.uid, (chats) => {
      setRecentChats(chats);
    });
    return () => unsub();
  }, [showForwardModal, user]);
  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isAdmin = channel?.members?.[user?.uid || '']?.role === 'admin';
  const canSend = isAdmin || (channel?.isOfficial && profile?.banned === false); // Simplified for demo
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const handleOpenEdit = () => {
    setNewName(channel?.name || '');
    setNewDesc(channel?.description || '');
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleUpdateChannel = async () => {
    if (!channelId) return;
    await services.broadcast.updateChannel(channelId as string, {
      name: newName,
      description: newDesc
    });
    setShowEditModal(false);
  };

  const handleClearChat = async () => {
    if (confirm('Clear all messages for you?')) {
      await services.chat.clearChat(`broadcast_${channelId}`, user!.uid);
      setShowDropdown(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (confirm('Delete this channel forever?')) {
      await services.broadcast.deleteChannel(channelId as string);
      router.push('/broadcast');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const url = await services.upload.uploadFile(file, `broadcasts/${channelId}/${Date.now()}_${file.name}`);
      const msgData: Partial<Message> = {
        image: url,
        sender: user.uid,
        senderName: profile?.name || user.displayName || 'User',
      };
      await services.broadcast.sendMessage(channelId as string, msgData);
      showSuccess('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c0c0c] text-[#e0e0e0] max-w-4xl mx-auto border-x border-[#1f1f1f]">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload}
      />
      {/* Top Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#1f1f1f] rounded-full transition-all text-[#6366f1]">
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-11 h-11 rounded-2xl bg-[#6366f1] flex items-center justify-center text-2xl shrink-0 border border-[#2a2a2a] shadow-lg shadow-[#6366f1]/20">
            {channel?.avatar || '📢'}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#e0e0e0] truncate">{channel?.name || 'Loading...'}</h2>
              {channel?.isOfficial && <ShieldCheck size={14} className="text-[#6366f1]" />}
            </div>
            <span className="text-[10px] text-[#666] font-black uppercase tracking-widest truncate block">
              {channel?.description || 'Broadcast Channel'}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="p-2.5 hover:bg-[#1f1f1f] rounded-full transition-all text-[#6366f1]">
            <MoreVertical size={20} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#18181b] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {isAdmin && (
                  <button 
                    onClick={() => { handleOpenEdit(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                  >
                    <Edit size={18} className="text-[#6366f1]" />
                    Edit Channel
                  </button>
                )}
                <button 
                  onClick={() => { setShowMembersModal(true); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                >
                  <Users size={18} className="text-[#6366f1]" />
                  Members
                </button>
                <button 
                  onClick={() => { navigator.clipboard.writeText(window.location.href); showSuccess('Invite link copied!'); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                >
                  <LinkIcon size={18} className="text-[#6366f1]" />
                  Invite
                </button>
                <div className="h-px bg-[#1f1f1f]" />
                <button 
                  onClick={handleClearChat}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                >
                  <Eraser size={18} className="text-[#6366f1]" />
                  Clear Chat
                </button>
                {isAdmin && (
                  <button 
                    onClick={handleDeleteChannel}
                    className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 text-red-500 transition-all text-sm font-semibold"
                  >
                    <Trash2 size={18} />
                    Delete Channel
                  </button>
                )}
                {!channel?.isOfficial && (
                  <button 
                    onClick={async () => {
                      if (confirm('Leave this broadcast channel?')) {
                        await services.broadcast.leaveChannel(channelId as string, user!.uid);
                        router.push('/broadcast');
                      }
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 text-red-500 transition-all text-sm font-semibold"
                  >
                    <LogOut size={18} />
                    Leave Channel
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-[#0c0c0c]">
        {messages.map((msg) => {
          const isOwn = msg.sender === user?.uid;
          const isSystem = (msg as any).isSystem;
          
          const reactionEntries = msg.reactions ? Object.entries(msg.reactions) : [];
          const reactionCounts: Record<string, number> = {};
          reactionEntries.forEach(([uid, emoji]) => {
            reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
          });

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4 animate-in fade-in duration-500 w-full">
                <div className="bg-[#1f1f1f] px-4 py-1.5 rounded-full text-[10px] font-black text-[#888] uppercase tracking-[0.2em] border border-[#2a2a2a]">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id}
              className={cn(
                "flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                isOwn ? "items-end" : "items-start"
              )}
            >
              <div className={cn("max-w-[85%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2 mb-1 ml-2">
                  <span className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest opacity-80">
                    {msg.senderName}
                  </span>
                  <span className="text-[8px] font-bold text-[#444]">{formatTime(msg.timestamp)}</span>
                  {msg.edited && <span className="text-[8px] italic text-[#444]">Edited</span>}
                </div>
                
                <div 
                  className={cn(
                    "px-5 py-3 rounded-2xl relative transition-all active:scale-[0.98] cursor-pointer",
                    isOwn 
                      ? "bg-[#6366f1] text-white rounded-br-none shadow-xl shadow-[#6366f1]/10" 
                      : "bg-[#18181b] text-[#e0e0e0] rounded-bl-none border border-[#1f1f1f]"
                  )}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessage(msg);
                }}
                onClick={() => setSelectedMessage(msg)}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                
                {/* Reactions Display */}
                {reactionEntries.length > 0 && (
                  <div className={cn(
                    "absolute -bottom-3 flex gap-1",
                    isOwn ? "right-0" : "left-0"
                  )}>
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                      <div key={emoji} className="bg-[#1f1f1f] border border-[#333] rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-md">
                        <span>{emoji}</span>
                        {count > 1 && <span className="text-[8px] font-bold text-[#6366f1]">{count}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Only for admins or authorized */}
      {isAdmin ? (
        <div className="p-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-[#6366f1] hover:bg-[#1f1f1f] rounded-2xl transition-all border border-[#1f1f1f]"
          >
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Broadcast a message..."
              className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-full py-4 px-6 text-sm text-white outline-none focus:border-[#6366f1] transition-all font-bold placeholder-[#444]"
            />
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#6366f1] hover:text-[#4f46e5]"
            >
              <Smile size={24} />
            </button>

            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute bottom-full right-0 mb-4 p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl z-[70] grid grid-cols-6 gap-2 w-max animate-in fade-in zoom-in-95 duration-200">
                  {['😀', '😂', '😍', '👍', '🔥', '❤️', '🙌', '🎉', '😢', '😮', '🤔', '😎', '🙏', '💯', '✨', '🚀', '🌈', '🍕'].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }}
                      className="text-xl p-1 hover:bg-[#1f1f1f] rounded-lg transition-all"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              "w-14 h-14 flex items-center justify-center rounded-2xl transition-all shrink-0 shadow-2xl",
              inputText.trim() 
                ? "bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-[#6366f1]/20 active:scale-95" 
                : "bg-[#1f1f1f] text-[#444] border border-[#2a2a2a]"
            )}
          >
            <Send size={24} />
          </button>
        </div>
      ) : (
        <div className="p-6 bg-[#0a0a0a] border-t border-[#1f1f1f] text-center">
          <p className="text-xs font-black text-[#444] uppercase tracking-[0.3em]">Only admins can send messages</p>
        </div>
      )}

      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        entityId={channelId || ''}
        type="broadcast"
        isAdmin={isAdmin}
        members={members}
      />

      {/* Menu Overlay */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#0a0a0a] rounded-[2.5rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {isEditing === selectedMessage.id ? (
              <div className="p-8 space-y-6">
                <h3 className="text-sm font-black text-[#6366f1] uppercase tracking-[0.2em]">Edit Broadcast</h3>
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-5 text-sm text-white outline-none focus:border-[#6366f1] min-h-[120px]"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setIsEditing(null); setSelectedMessage(null); }} className="flex-1 p-4 bg-[#111] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#444]">Cancel</button>
                  <button onClick={handleEdit} className="flex-1 p-4 bg-[#6366f1] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white">Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 flex gap-5 justify-center border-b border-[#1f1f1f] bg-[#111]">
                  {['❤️', '🔥', '😂', '👍', '😮', '😢'].map(emoji => (
                    <span 
                      key={emoji} 
                      onClick={() => handleReaction(selectedMessage.id, emoji)}
                      className={cn(
                        "text-3xl cursor-pointer hover:scale-125 transition-all p-1 rounded-xl",
                        selectedMessage.reactions?.[user?.uid || ''] === emoji && "bg-[#6366f1]/20 scale-110"
                      )}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 gap-1">
                  <button 
                    onClick={() => setShowForwardModal(true)}
                    className="flex items-center gap-5 p-5 hover:bg-[#1a1a1a] rounded-3xl transition-all text-[#e0e0e0]"
                  >
                    <Share2 size={22} className="text-[#6366f1]" />
                    <span className="font-black text-xs uppercase tracking-[0.2em]">Forward</span>
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => { setIsEditing(selectedMessage.id); setEditText(selectedMessage.text); }}
                        className="flex items-center gap-5 p-5 hover:bg-[#1a1a1a] rounded-3xl transition-all text-[#e0e0e0]"
                      >
                        <Edit size={22} className="text-[#6366f1]" />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="flex items-center gap-5 p-5 hover:bg-red-500/10 rounded-3xl transition-all text-red-500"
                      >
                        <Trash2 size={22} />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Delete for all</span>
                      </button>
                    </>
                  )}
                  {selectedMessage.sender !== user?.uid && (
                    <button 
                      onClick={() => {
                        router.push(`/report?messageId=${selectedMessage.id}`);
                        setSelectedMessage(null);
                      }}
                      className="flex items-center gap-5 p-5 hover:bg-[#1a1a1a] rounded-3xl transition-all text-[#444]"
                    >
                      <Flag size={22} />
                      <span className="font-black text-xs uppercase tracking-[0.2em]">Report</span>
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="w-full p-8 bg-[#0f0f0f] text-xs font-black uppercase tracking-[0.4em] text-[#444] border-t border-[#1f1f1f] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between bg-[#111]">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Forward to...</h2>
              <button onClick={() => setShowForwardModal(false)} className="text-[#444] hover:text-white transition-colors text-2xl">×</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <button 
                    key={chat.friendUid}
                    onClick={() => handleForward(chat.friendUid)}
                    className="w-full flex items-center gap-4 p-4 bg-[#111] hover:bg-[#1a1a1a] rounded-2xl border border-[#1f1f1f] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center font-bold text-white shrink-0">
                      {chat.friend?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{chat.friend?.name}</div>
                      <div className="text-[10px] text-[#444] font-mono tracking-widest uppercase">{chat.friend?.jgId}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-10 text-center text-[#444] text-xs font-bold uppercase tracking-widest">
                  No recent chats found
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowForwardModal(false)}
              className="w-full p-6 bg-[#0f0f0f] text-xs font-black uppercase tracking-[0.3em] text-[#444] border-t border-[#1f1f1f] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
