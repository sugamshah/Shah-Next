import { 
  ref, 
  push, 
  set, 
  onValue, 
  update, 
  serverTimestamp, 
  get,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { db } from './config';
import type { IChatService } from '../../domain/repositories/interfaces';
import type { Message } from '../../domain/entities';

import { S7Security } from '../../lib/security';

export class FirebaseChatService implements IChatService {
  async sendMessage(roomId: string, message: Partial<Message>): Promise<void> {
    // S-7 Security Check
    if (!S7Security.checkRateLimit(`sendMsg_${message.sender}`)) {
      throw new Error('S-7: Rate limit exceeded. Please wait.');
    }
    if (!S7Security.validatePayload(message)) {
      throw new Error('S-7: Suspicious content detected.');
    }

    let messagesPath = `chats/${roomId}/messages`;
    let isPrivate = true;

    if (roomId.startsWith('group_')) {
      messagesPath = `groupMessages/${roomId.replace('group_', '')}`;
      isPrivate = false;
    } else if (roomId.startsWith('broadcast_')) {
      messagesPath = `broadcastMessages/${roomId.replace('broadcast_', '')}`;
      isPrivate = false;
    }

    const messagesRef = ref(db, messagesPath);
    const newMessageRef = push(messagesRef);
    const msgId = newMessageRef.key!;
    
    const msgData = {
      ...message,
      id: msgId,
      timestamp: serverTimestamp(),
      read: false,
      deletedFor: {}
    };

    await set(newMessageRef, msgData);

    // Mention Detection & Notification
    if (msgData.text && msgData.text.includes('@')) {
      const mentions = msgData.text.match(/@([a-zA-Z0-9_]+)/g);
      const processed: Record<string, boolean> = {};

      if (mentions) {
        if (roomId.startsWith('group_')) {
          const groupId = roomId.replace('group_', '');
          const groupSnap = await get(ref(db, `groups/${groupId}/members`));
          const groupMembers = groupSnap.exists() ? Object.keys(groupSnap.val()) : [];

          if (mentions.some((mention) => mention.toLowerCase() === '@everyone')) {
            for (const memberUid of groupMembers) {
              if (memberUid === message.sender) continue;
              const notifRef = push(ref(db, `notifications/${memberUid}`));
              await set(notifRef, {
                type: 'mention',
                title: 'Group Notification',
                message: `${message.senderName || 'Someone'} mentioned everyone in group: "${msgData.text.substring(0, 50)}${msgData.text.length > 50 ? '...' : ''}"`,
                timestamp: Date.now(),
                read: false,
                link: `/group/${groupId}`,
                sender: {
                  name: message.senderName || 'Someone',
                  photoURL: ''
                }
              });
            }
          }

          for (const mention of mentions) {
            const handle = mention.slice(1);
            if (handle.toLowerCase() === 'everyone') continue;
            const usersRef = ref(db, 'users');
            const q = query(usersRef, orderByChild('handle'), equalTo(handle));
            const snapshot = await get(q);
            if (snapshot.exists()) {
              const usersObj = snapshot.val();
              const mentionedUid = Object.keys(usersObj)[0];
              if (mentionedUid !== message.sender && groupMembers.includes(mentionedUid) && !processed[mentionedUid]) {
                processed[mentionedUid] = true;
                const notifRef = push(ref(db, `notifications/${mentionedUid}`));
                await set(notifRef, {
                  type: 'mention',
                  title: 'New Mention',
                  message: `${message.senderName || 'Someone'} mentioned you: "${msgData.text.substring(0, 50)}${msgData.text.length > 50 ? '...' : ''}"`,
                  timestamp: Date.now(),
                  read: false,
                  link: `/group/${groupId}`,
                  sender: {
                    name: message.senderName || 'Someone',
                    photoURL: ''
                  }
                });
              }
            }
          }
        } else if (roomId.startsWith('broadcast_')) {
          const channelId = roomId.replace('broadcast_', '');
          const channelSnap = await get(ref(db, `broadcasts/${channelId}/members`));
          const channelMembers = channelSnap.exists() ? Object.keys(channelSnap.val()) : [];

          if (mentions.some((mention) => mention.toLowerCase() === '@everyone')) {
            for (const memberUid of channelMembers) {
              if (memberUid === message.sender) continue;
              const notifRef = push(ref(db, `notifications/${memberUid}`));
              await set(notifRef, {
                type: 'mention',
                title: 'Broadcast Notification',
                message: `${message.senderName || 'Someone'} mentioned everyone in broadcast: "${msgData.text.substring(0, 50)}${msgData.text.length > 50 ? '...' : ''}"`,
                timestamp: Date.now(),
                read: false,
                link: `/broadcast/${channelId}`,
                sender: {
                  name: message.senderName || 'Someone',
                  photoURL: ''
                }
              });
            }
          }

          for (const mention of mentions) {
            const handle = mention.slice(1);
            if (handle.toLowerCase() === 'everyone') continue;
            const usersRef = ref(db, 'users');
            const q = query(usersRef, orderByChild('handle'), equalTo(handle));
            const snapshot = await get(q);
            if (snapshot.exists()) {
              const usersObj = snapshot.val();
              const mentionedUid = Object.keys(usersObj)[0];
              if (mentionedUid !== message.sender && channelMembers.includes(mentionedUid) && !processed[mentionedUid]) {
                processed[mentionedUid] = true;
                const notifRef = push(ref(db, `notifications/${mentionedUid}`));
                await set(notifRef, {
                  type: 'mention',
                  title: 'New Mention',
                  message: `${message.senderName || 'Someone'} mentioned you: "${msgData.text.substring(0, 50)}${msgData.text.length > 50 ? '...' : ''}"`,
                  timestamp: Date.now(),
                  read: false,
                  link: `/broadcast/${channelId}`,
                  sender: {
                    name: message.senderName || 'Someone',
                    photoURL: ''
                  }
                });
              }
            }
          }
        } else {
          for (const mention of mentions) {
            const handle = mention.slice(1);
            const usersRef = ref(db, 'users');
            const q = query(usersRef, orderByChild('handle'), equalTo(handle));
            const snapshot = await get(q);
            if (snapshot.exists()) {
              const usersObj = snapshot.val();
              const mentionedUid = Object.keys(usersObj)[0];
              if (mentionedUid !== message.sender && !processed[mentionedUid]) {
                processed[mentionedUid] = true;
                const notifRef = push(ref(db, `notifications/${mentionedUid}`));
                await set(notifRef, {
                  type: 'mention',
                  title: 'New Mention',
                  message: `${message.senderName || 'Someone'} mentioned you: "${msgData.text.substring(0, 50)}${msgData.text.length > 50 ? '...' : ''}"`,
                  timestamp: Date.now(),
                  read: false,
                  link: isPrivate ? `/chat/${message.sender}` : `/chat/${message.receiver}`,
                  sender: {
                    name: message.senderName || 'Someone',
                    photoURL: ''
                  }
                });
              }
            }
          }
        }
      }
    }

    if (isPrivate) {
      const [u1, u2] = roomId.split('_');
      const b1 = await get(ref(db, `users/${u1}/blocked/${u2}`));
      const b2 = await get(ref(db, `users/${u2}/blocked/${u1}`));
      if (b1.exists() || b2.exists()) {
        // Rollback message if blocked (optional, but good for data integrity)
        await set(newMessageRef, null);
        throw new Error('S-7: Communication blocked between users.');
      }

      // Update chat list for both users
      const [uid1, uid2] = roomId.split('_');
      const updateChatList = async (uid: string, friendUid: string) => {
        const chatListRef = ref(db, `chat-list/${uid}/${friendUid}`);
        const chatSnap = await get(chatListRef);
        const currentData = chatSnap.val() || {};

        await update(chatListRef, {
          friendUid,
          lastMessage: message.text || (message.image ? 'Image' : 'File'),
          lastMessageTime: serverTimestamp(),
          createdAt: currentData.createdAt || serverTimestamp(),
          unread: uid === message.receiver ? (currentData.unread || 0) + 1 : (currentData.unread || 0)
        });
      };

      if (uid1 && uid2) {
        await updateChatList(uid1, uid2);
        await updateChatList(uid2, uid1);
      }
    } else if (roomId.startsWith('group_')) {
      // Update last activity for group
      const groupId = roomId.replace('group_', '');
      await update(ref(db, `groups/${groupId}`), {
        lastMessage: message.text || 'Media',
        lastMessageTime: serverTimestamp()
      });
    }
  }

  listenMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
    let messagesPath = `chats/${roomId}/messages`;
    if (roomId.startsWith('group_')) {
      messagesPath = `groupMessages/${roomId.replace('group_', '')}`;
    } else if (roomId.startsWith('broadcast_')) {
      messagesPath = `broadcastMessages/${roomId.replace('broadcast_', '')}`;
    }

    // Use a simple ref to avoid indexing issues causing permission_denied in some RTDB configs
    const messagesRef = ref(db, messagesPath);
    return onValue(messagesRef, (snap) => {
      const messages: Message[] = [];
      snap.forEach((child) => {
        const data = child.val() as Message;
        if (data) {
          messages.push({ ...data, id: child.key || data.id });
        }
      });
      // Sort on client for maximum compatibility
      messages.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
      callback(messages);
    }, (err) => {
      console.error('listenMessages error:', err);
      callback([]);
    });
  }

  listenChatList(uid: string, callback: (chats: any[]) => void): () => void {
    const chatListRef = query(ref(db, `chat-list/${uid}`), orderByChild('lastMessageTime'));
    return onValue(chatListRef, async (snap) => {
      const chats: any[] = [];
      const promises: Promise<void>[] = [];

      snap.forEach((child) => {
        const chatData = child.val();
        const friendUid = child.key!;
        
        if (friendUid === 'undefined') return;
        
        const promise = get(ref(db, `users/${friendUid}`)).then(userSnap => {
          if (userSnap.exists()) {
            chats.push({
              ...chatData,
              friendUid,
              friend: userSnap.val()
            });
          }
        }).catch(err => {
          console.error(`Permission denied or error fetching profile for ${friendUid}`, err);
          // Still add the chat item but with minimal friend info or placeholder
          chats.push({
            ...chatData,
            friendUid,
            friend: { name: 'User', jgId: 'Unknown' }
          });
        });
        promises.push(promise);
      });

      await Promise.all(promises);
      // Sort because Firebase RTDB orderByChild is ascending and forEach respects it, but we might want descending for chat list
      callback(chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0)));
    });
  }

  async markAsRead(roomId: string, uid: string, friendUid: string): Promise<void> {
    let messagesPath = `chats/${roomId}/messages`;
    if (roomId.startsWith('group_')) {
      messagesPath = `groupMessages/${roomId.replace('group_', '')}`;
    } else if (roomId.startsWith('broadcast_')) {
      messagesPath = `broadcastMessages/${roomId.replace('broadcast_', '')}`;
    }

    const messagesRef = ref(db, messagesPath);
    const unreadSnap = await get(messagesRef);
    const updates: Record<string, any> = {};
    
    unreadSnap.forEach((msgSnap) => {
      const msg = msgSnap.val();
      if (msg.sender === friendUid && !msg.read) {
        updates[`${msgSnap.key}/read`] = true;
        updates[`${msgSnap.key}/readAt`] = Date.now();
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(messagesRef, updates);
    }

    if (!roomId.startsWith('group_') && !roomId.startsWith('broadcast_')) {
      await set(ref(db, `chat-list/${uid}/${friendUid}/unread`), 0);
    }
  }

  async deleteMessage(roomId: string, messageId: string, forEveryone: boolean, uid: string): Promise<void> {
    let messagePath = `chats/${roomId}/messages/${messageId}`;
    let pinnedPath = `chats/${roomId}/pinnedMessageId`;

    if (roomId.startsWith('group_')) {
      const groupId = roomId.replace('group_', '');
      messagePath = `groupMessages/${groupId}/${messageId}`;
      pinnedPath = `groups/${groupId}/pinnedMessageId`;
    } else if (roomId.startsWith('broadcast_')) {
      const channelId = roomId.replace('broadcast_', '');
      messagePath = `broadcastMessages/${channelId}/${messageId}`;
      pinnedPath = `broadcasts/${channelId}/pinnedMessageId`;
    }

    if (forEveryone) {
      await set(ref(db, messagePath), null);
      // Also remove from pinned if it was pinned
      const pinnedSnap = await get(ref(db, pinnedPath));
      if (pinnedSnap.val() === messageId) {
        await set(ref(db, pinnedPath), null);
      }
    } else {
      await set(ref(db, `${messagePath}/deletedFor/${uid}`), true);
    }
  }

  async editMessage(roomId: string, messageId: string, text: string): Promise<void> {
    let messagePath = `chats/${roomId}/messages/${messageId}`;
    if (roomId.startsWith('group_')) {
      messagePath = `groupMessages/${roomId.replace('group_', '')}/${messageId}`;
    } else if (roomId.startsWith('broadcast_')) {
      messagePath = `broadcastMessages/${roomId.replace('broadcast_', '')}/${messageId}`;
    }

    await update(ref(db, messagePath), {
      text,
      edited: true
    });
  }

  async togglePinMessage(roomId: string, messageId: string): Promise<void> {
    let pinnedPath = `chats/${roomId}/pinnedMessageId`;
    if (roomId.startsWith('group_')) {
      pinnedPath = `groups/${roomId.replace('group_', '')}/pinnedMessageId`;
    } else if (roomId.startsWith('broadcast_')) {
      pinnedPath = `broadcasts/${roomId.replace('broadcast_', '')}/pinnedMessageId`;
    }

    const pinnedRef = ref(db, pinnedPath);
    const snap = await get(pinnedRef);
    if (snap.val() === messageId) {
      await set(pinnedRef, null);
    } else {
      await set(pinnedRef, messageId);
    }
  }

  async addReaction(roomId: string, messageId: string, emoji: string, uid: string): Promise<void> {
    let path = `chats/${roomId}/messages/${messageId}/reactions/${uid}`;
    if (roomId.startsWith('group_')) {
      path = `groupMessages/${roomId.replace('group_', '')}/${messageId}/reactions/${uid}`;
    } else if (roomId.startsWith('broadcast_')) {
      path = `broadcastMessages/${roomId.replace('broadcast_', '')}/${messageId}/reactions/${uid}`;
    }
    
    const reactionRef = ref(db, path);
    const snap = await get(reactionRef);
    if (snap.val() === emoji) {
      await set(reactionRef, null); // Remove if same emoji
    } else {
      await set(reactionRef, emoji);
    }
  }

  async reportMessage(messageId: string, reporterUid: string, reason: string): Promise<void> {
    const reportRef = push(ref(db, 'reports'));
    await set(reportRef, {
      messageId,
      reporterUid,
      reason,
      timestamp: serverTimestamp(),
      status: 'pending'
    });
  }

  async clearChat(roomId: string, uid: string): Promise<void> {
    let messagesPath = `chats/${roomId}/messages`;
    if (roomId.startsWith('group_')) {
      messagesPath = `groupMessages/${roomId.replace('group_', '')}`;
    } else if (roomId.startsWith('broadcast_')) {
      messagesPath = `broadcastMessages/${roomId.replace('broadcast_', '')}`;
    }

    const messagesRef = ref(db, messagesPath);
    const snap = await get(messagesRef);
    const updates: Record<string, any> = {};
    
    snap.forEach((child) => {
      updates[`${child.key}/deletedFor/${uid}`] = true;
    });

    if (Object.keys(updates).length > 0) {
      await update(messagesRef, updates);
    }

    // Also update chat list for private chats
    if (!roomId.startsWith('group_') && !roomId.startsWith('broadcast_')) {
      const [uid1, uid2] = roomId.split('_');
      const friendUid = uid === uid1 ? uid2 : uid1;
      await update(ref(db, `chat-list/${uid}/${friendUid}`), {
        lastMessage: 'Messages cleared',
        unread: 0
      });
    }
  }
}
