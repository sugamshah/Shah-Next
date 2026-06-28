'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { services } from '@/services/container';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Image as ImageIcon, 
  Paperclip, 
  Mic,
  Smile,
  Circle,
  Pin,
  Trash2,
  Edit2,
  Reply,
  Share2,
  Flag,
  MessageSquare,
  Ban
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/domain/entities';

export default function PrivateChatPage() {
  const { user, profile } = useAuth();
  const { error: showError, success: showSuccess, warning: showWarning } = useToast();
  const { uid: friendUid } = useParams();
  const [friend, setFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (friendUid === 'undefined') {
      router.replace('/chat');
    }
  }, [friendUid, router]);

  const roomId = [user?.uid, friendUid].sort().join('_');

  useEffect(() => {
    if (!friendUid || !user) return;

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const fetchFriend = async () => {
      try {
        const f = await services.user.getUserProfile(friendUid as string);
        setFriend(f);
      } catch (err) {
        console.error('Error fetching friend profile:', err);
      }
    };

    fetchFriend();

    const unsubBlocks = services.user.listenToUserProfile(user.uid, (p) => {
      setHasBlocked(!!p?.blocked?.[friendUid as string]);
    });

    const unsubFriendBlocks = services.user.listenToUserProfile(friendUid as string, (p) => {
      setIsBlocked(!!p?.blocked?.[user.uid]);
    });

    const unsub = services.chat.listenMessages(roomId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      unsub();
      unsubBlocks();
      unsubFriendBlocks();
      clearTimeout(timeout);
    };
  }, [friendUid, user, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (imageUrl?: string) => {
    if ((!inputText.trim() && !imageUrl) || !user) return;

    if (isBlocked || hasBlocked) {
      showWarning('Communication is restricted.');
      return;
    }

    const msgData: Partial<Message> = {
      text: inputText.trim(),
      image: imageUrl || null,
      sender: user.uid,
      senderName: profile?.name || user.displayName || 'User',
      receiver: friendUid as string,
      replyTo: replyTo?.id || null,
    };

    setInputText('');
    setReplyTo(null);
    try {
      await services.chat.sendMessage(roomId, msgData);
      showSuccess('Message sent successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to send message');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const url = await services.upload.uploadFile(file, `chats/${roomId}/${Date.now()}_${file.name}`);
      await handleSend(url);
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!user || !friendUid) return;
    await services.user.toggleBlockUser(user.uid, friendUid as string);
    setShowDropdown(false);
  };

  const handleEdit = async () => {
    if (!editText.trim() || !isEditing) return;
    await services.chat.editMessage(roomId, isEditing, editText.trim());
    setIsEditing(null);
    setEditText('');
    setSelectedMessage(null);
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!user) return;
    await services.chat.addReaction(roomId, msgId, emoji, user.uid);
    setSelectedMessage(null);
  };

  const handleDelete = async (msgId: string, forEveryone: boolean) => {
    if (!user) return;
    await services.chat.deleteMessage(roomId, msgId, forEveryone, user.uid);
    setSelectedMessage(null);
  };

  const handlePin = async (msgId: string) => {
    await services.chat.togglePinMessage(roomId, msgId);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0c0c0c] text-[#e0e0e0] max-w-4xl mx-auto border-x border-[#1f1f1f]">
      {/* Top Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#1f1f1f] rounded-full transition-all text-[#6366f1]">
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-11 h-11 rounded-full bg-[#6366f1] flex items-center justify-center font-bold text-white shrink-0 overflow-hidden shadow-lg shadow-[#6366f1]/20 relative">
            {friend?.photoURL ? (
              <Image src={friend.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
            ) : (
              friend?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-bold text-[#e0e0e0] truncate">{friend?.name || 'Loading...'}</h2>
            <div className="flex items-center gap-1.5">
              <Circle size={8} fill={friend?.status === 'online' ? '#22c55e' : '#64748b'} className={friend?.status === 'online' ? 'text-[#22c55e]' : 'text-[#64748b]'} />
              <span className="text-[10px] text-[#888] font-medium uppercase tracking-wider">
                {friend?.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 hover:bg-[#1f1f1f] rounded-full transition-all text-[#6366f1]">
            <MoreVertical size={20} />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl z-[110] animate-in slide-in-from-top-2">
              <button 
                onClick={() => { router.push(`/profile/${friend?.jgId}`); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#111] transition-all text-sm font-semibold"
              >
                <ImageIcon size={18} className="text-[#6366f1]" />
                View Profile
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to clear this chat?')) {
                    await services.chat.clearChat(roomId, user!.uid);
                    setShowDropdown(false);
                  }
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#111] transition-all text-sm font-semibold text-red-500"
              >
                <Trash2 size={18} />
                Clear Chat
              </button>
              <button 
                onClick={handleToggleBlock}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#111] transition-all text-sm font-semibold text-red-500"
              >
                <Ban size={18} />
                {hasBlocked ? 'Unblock User' : 'Block User'}
              </button>
              <button 
                onClick={() => {
                  router.push(`/report?reportedUid=${friend?.uid}&reportedName=${encodeURIComponent(friend?.name || 'User')}`);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#111] transition-all text-sm font-semibold text-red-500"
              >
                <Flag size={18} />
                Report User
              </button>
              <button 
                onClick={() => setShowDropdown(false)}
                className="w-full p-4 bg-[#111] text-[10px] font-black uppercase tracking-widest text-[#444] border-t border-[#1f1f1f]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth custom-scrollbar bg-[#0c0c0c]">
        {messages.length > 0 ? (
          messages.filter(m => !m.deletedFor?.[user?.uid || '']).map((msg) => {
            const isOwn = msg.sender === user?.uid;
            const reactionEntries = msg.reactions ? Object.entries(msg.reactions) : [];
            
            // Count unique reactions
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
                    <span className="text-[10px] font-bold text-[#6366f1] mb-1 ml-2 uppercase tracking-widest opacity-70">
                      {msg.senderName}
                    </span>
                  )}
                  
                  <div 
                    className={cn(
                      "px-4 py-2.5 rounded-2xl relative group cursor-pointer transition-all active:scale-[0.98]",
                      isOwn 
                        ? "bg-[#6366f1] text-white rounded-br-none shadow-lg shadow-[#6366f1]/10" 
                        : "bg-[#18181b] text-[#e0e0e0] rounded-bl-none border border-[#334155]"
                    )}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMessage(msg);
                    }}
                    onClick={() => setSelectedMessage(msg)}
                  >
                  {msg.replyTo && (
                    <div className={cn(
                      "mb-2 p-2 rounded-lg text-xs border-l-2 bg-black/10 truncate",
                      isOwn ? "border-white/50" : "border-[#6366f1]/50"
                    )}>
                      ↩️ Replying to...
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  {msg.image && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-full">
                      <Image src={msg.image} alt="Media" width={400} height={400} className="object-cover w-full h-auto" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "text-[9px] mt-1.5 opacity-60 font-medium flex items-center justify-end gap-1",
                    isOwn ? "text-white" : "text-[#888]"
                  )}>
                    {msg.edited && <span className="text-[8px] italic uppercase tracking-tighter">Edited</span>}
                    {formatTime(msg.timestamp)}
                    {isOwn && (
                      <span className="text-[10px]">
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
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
        })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#444] space-y-4">
            <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center border border-[#1f1f1f]">
              <MessageSquare className="opacity-20" size={32} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-[#6366f1] uppercase tracking-widest">Start Chatting!</p>
              <p className="text-xs text-[#888] font-medium">Begin your conversation with {friend?.name}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-[#18181b] border-t border-[#1f1f1f] flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="min-w-0 border-l-2 border-[#6366f1] pl-3">
            <div className="text-[10px] font-bold text-[#6366f1] uppercase">Replying to {replyTo.senderName}</div>
            <div className="text-xs text-[#888] truncate">{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-[#2a2a2a] rounded-full text-[#666]">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex flex-col gap-3 shrink-0">
        {(isBlocked || hasBlocked) ? (
          <div className="flex items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-3xl animate-in fade-in zoom-in-95">
             <div className="flex flex-col items-center gap-2 text-center">
               <Ban className="text-red-500" size={24} />
               <p className="text-sm font-black text-red-500 uppercase tracking-widest">
                 {isBlocked ? 'This user has restricted your access' : 'You have blocked this user'}
               </p>
               {hasBlocked && (
                 <button onClick={handleToggleBlock} className="text-[10px] font-black text-white bg-red-500 px-4 py-1.5 rounded-full uppercase tracking-tighter mt-2 hover:bg-red-600 transition-all">Unblock Now</button>
               )}
             </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-2.5 text-[#6366f1] hover:bg-[#1f1f1f] rounded-full transition-all">
                <Paperclip size={20} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-[#6366f1] hover:bg-[#1f1f1f] rounded-full transition-all"
              >
                <ImageIcon size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-full py-3 pl-5 pr-12 text-sm text-white outline-none focus:border-[#6366f1] transition-all"
              />
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#6366f1] hover:text-[#4f46e5]"
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
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-full transition-all shrink-0 shadow-lg shadow-[#6366f1]/20",
                inputText.trim() 
                  ? "bg-[#6366f1] text-white hover:bg-[#4f46e5] active:scale-95" 
                  : "bg-[#1f1f1f] text-[#444]"
              )}
            >
              {inputText.trim() ? <Send size={20} /> : <Mic size={20} />}
            </button>
          </div>
        )}
      </div>

      {/* Message Menu Overlay */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0a0a0a] rounded-3xl border border-[#1f1f1f] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {isEditing === selectedMessage.id ? (
              <div className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#6366f1] uppercase tracking-widest">Edit Message</h3>
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-4 text-sm outline-none focus:border-[#6366f1] min-h-[100px]"
                />
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(null); setSelectedMessage(null); }} className="flex-1 p-3 bg-[#111] rounded-xl text-xs font-bold uppercase">Cancel</button>
                  <button onClick={handleEdit} className="flex-1 p-3 bg-[#6366f1] rounded-xl text-xs font-bold uppercase">Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 flex gap-3 justify-center border-b border-[#1f1f1f] bg-[#111]">
                  {['❤️', '🔥', '😂', '👍', '😮', '😢'].map(emoji => (
                    <span 
                      key={emoji} 
                      onClick={() => handleReaction(selectedMessage.id, emoji)}
                      className={cn(
                        "text-2xl cursor-pointer hover:scale-125 transition-transform p-1 rounded-lg",
                        selectedMessage.reactions?.[user?.uid || ''] === emoji && "bg-[#6366f1]/20 scale-110"
                      )}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <div className="p-2 grid grid-cols-1">
                  <button 
                    onClick={() => { setReplyTo(selectedMessage); setSelectedMessage(null); }}
                    className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl transition-all text-[#e0e0e0]"
                  >
                    <Reply size={18} className="text-[#6366f1]" />
                    <span className="font-semibold text-sm">Reply</span>
                  </button>
                  <button 
                    onClick={() => handlePin(selectedMessage.id)}
                    className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl transition-all text-[#e0e0e0]"
                  >
                    <Pin size={18} className="text-[#6366f1]" />
                    <span className="font-semibold text-sm">Pin Message</span>
                  </button>
                  <button 
                    onClick={() => setShowForwardModal(true)}
                    className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl transition-all text-[#e0e0e0]"
                  >
                    <Share2 size={18} className="text-[#6366f1]" />
                    <span className="font-semibold text-sm">Forward</span>
                  </button>
                  {selectedMessage.sender === user?.uid && (
                    <button 
                      onClick={() => { setIsEditing(selectedMessage.id); setEditText(selectedMessage.text); }}
                      className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl transition-all text-[#e0e0e0]"
                    >
                      <Edit2 size={18} className="text-[#6366f1]" />
                      <span className="font-semibold text-sm">Edit</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedMessage.id, false)}
                    className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-all text-red-500"
                  >
                    <Trash2 size={18} />
                    <span className="font-semibold text-sm">Delete for me</span>
                  </button>
                  {selectedMessage.sender === user?.uid && (
                    <button 
                      onClick={() => handleDelete(selectedMessage.id, true)}
                      className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-all text-red-500"
                    >
                      <Trash2 size={18} />
                      <span className="font-semibold text-sm">Delete for everyone</span>
                    </button>
                  )}
                  {selectedMessage.sender !== user?.uid && (
                    <button 
                      onClick={() => {
                        router.push(`/report?messageId=${selectedMessage.id}`);
                        setSelectedMessage(null);
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl transition-all text-[#888]"
                    >
                      <Flag size={18} />
                      <span className="font-semibold text-sm">Report Message</span>
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="w-full p-4 bg-[#111] text-xs font-black uppercase tracking-widest text-[#444] border-t border-[#1f1f1f] hover:text-[#666]"
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
