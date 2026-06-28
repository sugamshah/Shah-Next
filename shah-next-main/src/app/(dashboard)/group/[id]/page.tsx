'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { services } from '@/services/container';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Image as ImageIcon, 
  Mic,
  Smile,
  Users,
  Trash2,
  Edit2,
  Reply,
  Share2,
  Flag,
  UserPlus,
  LogOut,
  Settings,
  Pin,
  Eraser
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Message, Group, User } from '@/domain/entities';

export default function GroupChatPage() {
  const { user, profile } = useAuth();
  const { id: groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!groupId || !user) return;

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const fetchGroup = async () => {
      try {
        const g = await services.group.getGroup(groupId as string);
        setGroup(g);
      } catch (err) {
        console.error('Failed to fetch group', err);
      }
    };

    fetchGroup();

    // Listen to messages (Using ChatService logic but for groups)
    const unsub = services.chat.listenMessages(`group_${groupId}`, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [groupId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const msgData: Partial<Message> = {
      text: inputText.trim(),
      sender: user.uid,
      senderName: profile?.name || user.displayName || 'User',
      replyTo: replyTo?.id || null,
    };

    setInputText('');
    setReplyTo(null);
    await services.chat.sendMessage(`group_${groupId}`, msgData);
  };

  const handleEdit = async () => {
    if (!editText.trim() || !isEditing) return;
    await services.chat.editMessage(`group_${groupId}`, isEditing, editText.trim());
    setIsEditing(null);
    setEditText('');
    setSelectedMessage(null);
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!user) return;
    await services.chat.addReaction(`group_${groupId}`, msgId, emoji, user.uid);
    setSelectedMessage(null);
  };

  const handleDelete = async (msgId: string) => {
    if (!user) return;
    // For groups, we always delete for everyone (admin/sender can do it)
    await services.chat.deleteMessage(`group_${groupId}`, msgId, true, user.uid);
    setSelectedMessage(null);
  };

  const handlePin = async (msgId: string) => {
    await services.chat.togglePinMessage(`group_${groupId}`, msgId);
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
    alert('Message forwarded!');
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

  const isAdmin = group?.admins?.[user?.uid || ''];
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const handleOpenEdit = () => {
    setNewName(group?.name || '');
    setNewDesc(group?.description || '');
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleUpdateGroup = async () => {
    if (!groupId) return;
    await services.group.updateGroup(groupId as string, {
      name: newName,
      description: newDesc
    });
    setShowEditModal(false);
  };

  const handleClearChat = async () => {
    if (confirm('Clear all messages for you?')) {
      await services.chat.clearChat(`group_${groupId}`, user!.uid);
      setShowDropdown(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const url = await services.upload.uploadFile(file, `groups/${groupId}/${Date.now()}_${file.name}`);
      const msgData: Partial<Message> = {
        image: url,
        sender: user.uid,
        senderName: profile?.name || user.displayName || 'User',
      };
      await services.chat.sendMessage(`group_${groupId}`, msgData);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image.');
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
          
          <div className="w-11 h-11 rounded-2xl bg-[#6366f1] flex items-center justify-center text-2xl shrink-0 border border-[#2a2a2a] shadow-lg shadow-[#6366f1]/10">
            {group?.avatar || '👥'}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-bold text-[#e0e0e0] truncate">{group?.name || 'Loading...'}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#22c55e] font-black uppercase tracking-widest">
                {Object.keys(group?.members || {}).length} Members
              </span>
            </div>
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
                <button 
                  onClick={() => { setShowMembers(true); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                >
                  <Users size={18} className="text-[#6366f1]" />
                  Members
                </button>
                <button 
                  onClick={() => { router.push(`/group/invite/${groupId}`); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                >
                  <UserPlus size={18} className="text-[#6366f1]" />
                  Add Member
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => { handleOpenEdit(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                  >
                    <Edit2 size={18} className="text-[#6366f1]" />
                    Edit Group
                  </button>
                )}
                <button 
                  onClick={handleClearChat}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition-all text-sm font-semibold"
                >
                  <Eraser size={18} className="text-[#6366f1]" />
                  Clear Chat
                </button>
                <div className="h-px bg-[#1f1f1f]" />
                <button 
                  onClick={async () => {
                    if (confirm('Leave this group?')) {
                      await services.group.leaveGroup(groupId as string, user!.uid);
                      router.push('/group');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 text-red-500 transition-all text-sm font-semibold"
                >
                  <LogOut size={18} />
                  Leave Group
                </button>
                {isAdmin && (
                  <button 
                    onClick={async () => {
                      if (confirm('Delete this group forever?')) {
                        await services.group.deleteGroup(groupId as string);
                        router.push('/group');
                      }
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 text-red-500 transition-all text-sm font-semibold"
                  >
                    <Trash2 size={18} />
                    Delete Group
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
          const reactionEntries = msg.reactions ? Object.entries(msg.reactions) : [];
          const reactionCounts: Record<string, number> = {};
          reactionEntries.forEach(([uid, emoji]) => {
            reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
          });

          return (
            <div 
              key={msg.id}
              className={cn(
                "flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                isOwn ? "items-end" : "items-start"
              )}
            >
              <div className={cn("max-w-[85%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                {!isOwn && (
                  <span className="text-[10px] font-black text-[#6366f1] mb-1 ml-2 uppercase tracking-widest opacity-80">
                    {msg.senderName}
                  </span>
                )}
                
                <div 
                  className={cn(
                    "px-4 py-2.5 rounded-2xl relative transition-all active:scale-[0.98] cursor-pointer",
                    isOwn 
                      ? "bg-[#6366f1] text-white rounded-br-none shadow-lg shadow-[#6366f1]/10" 
                      : "bg-[#18181b] text-[#e0e0e0] rounded-bl-none border border-[#1f1f1f]"
                  )}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessage(msg);
                }}
                onClick={() => setSelectedMessage(msg)}
              >
                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded-lg text-[10px] bg-black/20 border-l-2 border-[#6366f1] italic opacity-70 truncate">
                    ↩️ Replying to...
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                <div className="text-[9px] mt-1.5 text-right opacity-60 font-bold uppercase tracking-tighter flex items-center justify-end gap-1">
                  {msg.edited && <span>Edited</span>}
                  {formatTime(msg.timestamp)}
                </div>

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

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-3 bg-[#18181b] border-t border-[#1f1f1f] flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="min-w-0 border-l-4 border-[#6366f1] pl-4">
            <div className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest mb-1">Replying to {replyTo.senderName}</div>
            <div className="text-xs text-[#888] truncate italic">{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-2 hover:bg-[#2a2a2a] rounded-full text-[#666] transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {/* Input */}
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
            placeholder="Message group..."
            className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl py-3.5 px-5 text-sm text-white outline-none focus:border-[#6366f1] transition-all placeholder-[#444]"
          />
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#6366f1] hover:text-[#4f46e5]"
          >
            <Smile size={20} />
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
            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all shrink-0 shadow-xl",
            inputText.trim() 
              ? "bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-[#6366f1]/20 active:scale-95" 
              : "bg-[#1f1f1f] text-[#444] border border-[#2a2a2a]"
          )}
        >
          {inputText.trim() ? <Send size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Menu Overlay */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {isEditing === selectedMessage.id ? (
              <div className="p-8 space-y-6">
                <h3 className="text-sm font-black text-[#6366f1] uppercase tracking-[0.2em]">Edit Message</h3>
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-5 text-sm text-white outline-none focus:border-[#6366f1] min-h-[120px]"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setIsEditing(null); setSelectedMessage(null); }} className="flex-1 p-4 bg-[#111] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#444]">Cancel</button>
                  <button onClick={handleEdit} className="flex-1 p-4 bg-[#6366f1] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#6366f1]/20">Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 flex gap-4 justify-center border-b border-[#1f1f1f] bg-[#111]">
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
                <div className="p-3 grid grid-cols-1 gap-1">
                  <button 
                    onClick={() => { setReplyTo(selectedMessage); setSelectedMessage(null); }}
                    className="flex items-center gap-4 p-5 hover:bg-[#1a1a1a] rounded-2xl transition-all text-[#e0e0e0]"
                  >
                    <Reply size={20} className="text-[#6366f1]" />
                    <span className="font-bold text-sm uppercase tracking-wider">Reply</span>
                  </button>
                  <button 
                    onClick={() => handlePin(selectedMessage.id)}
                    className="flex items-center gap-4 p-5 hover:bg-[#1a1a1a] rounded-2xl transition-all text-[#e0e0e0]"
                  >
                    <Pin size={20} className="text-[#6366f1]" />
                    <span className="font-bold text-sm uppercase tracking-wider">Pin Message</span>
                  </button>
                  <button 
                    onClick={() => setShowForwardModal(true)}
                    className="flex items-center gap-4 p-5 hover:bg-[#1a1a1a] rounded-2xl transition-all text-[#e0e0e0]"
                  >
                    <Share2 size={20} className="text-[#6366f1]" />
                    <span className="font-bold text-sm uppercase tracking-wider">Forward</span>
                  </button>
                  {isOwnAction(selectedMessage) && (
                    <>
                      <button 
                        onClick={() => { setIsEditing(selectedMessage.id); setEditText(selectedMessage.text); }}
                        className="flex items-center gap-4 p-5 hover:bg-[#1a1a1a] rounded-2xl transition-all text-[#e0e0e0]"
                      >
                        <Edit2 size={20} className="text-[#6366f1]" />
                        <span className="font-bold text-sm uppercase tracking-wider">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="flex items-center gap-4 p-5 hover:bg-red-500/10 rounded-2xl transition-all text-red-500"
                      >
                        <Trash2 size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider">Delete for all</span>
                      </button>
                    </>
                  )}
                  {selectedMessage.sender !== user?.uid && (
                    <button 
                      onClick={() => {
                        router.push(`/report?messageId=${selectedMessage.id}`);
                        setSelectedMessage(null);
                      }}
                      className="flex items-center gap-4 p-5 hover:bg-[#1a1a1a] rounded-2xl transition-all text-[#444]"
                    >
                      <Flag size={20} />
                      <span className="font-bold text-sm uppercase tracking-wider">Report Message</span>
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="w-full p-6 bg-[#0f0f0f] text-xs font-black uppercase tracking-[0.3em] text-[#444] border-t border-[#1f1f1f] hover:text-white transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-[2rem] border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-[#1f1f1f] flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Group Members</h2>
              <button onClick={() => setShowMembers(false)} className="text-[#444] hover:text-white transition-colors text-2xl font-light">×</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {Object.entries(group?.members || {}).map(([uid, m]: [string, any]) => (
                <div key={uid} className="flex items-center justify-between p-4 bg-[#111] rounded-2xl border border-[#1f1f1f]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e2937] flex items-center justify-center font-bold text-[#6366f1]">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{m.name}</div>
                      <div className="text-[10px] text-[#444] font-mono tracking-widest uppercase">{m.jgId}</div>
                    </div>
                  </div>
                  {group?.admins?.[uid] && (
                    <span className="px-2 py-0.5 bg-[#6366f1]/10 text-[#6366f1] text-[8px] font-black uppercase tracking-widest rounded border border-[#6366f1]/20">Admin</span>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowMembers(false)}
              className="w-full p-6 bg-[#0f0f0f] text-xs font-black uppercase tracking-[0.3em] text-[#444] border-t border-[#1f1f1f] hover:text-white transition-colors"
            >
              Close
            </button>
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

  function isOwnAction(msg: Message) {
    return msg.sender === user?.uid || isAdmin;
  }
}
