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
import type { IBroadcastService } from '../../domain/repositories/interfaces';
import type { Broadcast, Message } from '../../domain/entities';

export class FirebaseBroadcastService implements IBroadcastService {
  private generateInviteCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async createUniqueInviteCode(length = 6): Promise<string> {
    const broadcastsRef = ref(db, 'broadcasts');
    let attempt = 0;

    while (attempt < 10) {
      const code = this.generateInviteCode(length).toUpperCase();
      const q = query(broadcastsRef, orderByChild('inviteCode'), equalTo(code));
      const snap = await get(q);
      if (!snap.exists()) {
        return code;
      }
      attempt += 1;
    }

    throw new Error('Unable to generate a unique invite code. Please try again later.');
  }

  async createChannel(channel: Partial<Broadcast>, creatorUid: string): Promise<string> {
    const channelRef = push(ref(db, 'broadcasts'));
    const channelId = channelRef.key!;
    const inviteCode = await this.createUniqueInviteCode();
    
    const channelData: Broadcast = {
      ...channel as Broadcast,
      id: channelId,
      createdBy: creatorUid,
      createdAt: serverTimestamp(),
      inviteCode,
      members: {
        [creatorUid]: { role: 'admin', joinedAt: serverTimestamp() }
      }
    };

    await set(channelRef, channelData);
    await set(ref(db, `userBroadcasts/${creatorUid}/${channelId}`), true);
    
    return channelId;
  }

  async getChannel(channelId: string): Promise<Broadcast | null> {
    const snap = await get(ref(db, `broadcasts/${channelId}`));
    return snap.exists() ? (snap.val() as Broadcast) : null;
  }

  async getChannelByInviteCode(inviteCode: string): Promise<Broadcast | null> {
    const normalizedCode = inviteCode.trim().toUpperCase();
    const broadcastsRef = ref(db, 'broadcasts');
    const q = query(broadcastsRef, orderByChild('inviteCode'), equalTo(normalizedCode));
    const snap = await get(q);
    
    if (snap.exists()) {
      const data = snap.val();
      const channelId = Object.keys(data)[0];
      return { ...data[channelId], id: channelId } as Broadcast;
    }
    return null;
  }

  async regenerateInviteCode(channelId: string): Promise<string> {
    const newCode = await this.createUniqueInviteCode();
    await update(ref(db, `broadcasts/${channelId}`), { inviteCode: newCode });
    return newCode;
  }

  async updateChannel(channelId: string, updates: Partial<Broadcast>): Promise<void> {
    await update(ref(db, `broadcasts/${channelId}`), updates);
  }

  async deleteChannel(channelId: string): Promise<void> {
    const channel = await this.getChannel(channelId);
    if (!channel) return;

    const members = Object.keys(channel.members || {});
    for (const uid of members) {
      await set(ref(db, `userBroadcasts/${uid}/${channelId}`), null);
    }
    
    await set(ref(db, `broadcasts/${channelId}`), null);
    await set(ref(db, `broadcastMessages/${channelId}`), null);
  }

  async joinChannel(channelId: string, uid: string): Promise<void> {
    const memberRef = ref(db, `broadcasts/${channelId}/members/${uid}`);
    const memberSnap = await get(memberRef);
    if (memberSnap.exists()) {
      await set(ref(db, `userBroadcasts/${uid}/${channelId}`), true);
      return;
    }

    await set(memberRef, {
      role: 'member',
      joinedAt: serverTimestamp()
    });
    await set(ref(db, `userBroadcasts/${uid}/${channelId}`), true);
  }

  async joinChannelByInviteCode(inviteCode: string, uid: string): Promise<string> {
    const channel = await this.getChannelByInviteCode(inviteCode.trim().toUpperCase());
    if (!channel) throw new Error('Invalid invite code');
    
    await this.joinChannel(channel.id!, uid);
    return channel.id!;
  }

  async leaveChannel(channelId: string, uid: string): Promise<void> {
    await set(ref(db, `broadcasts/${channelId}/members/${uid}`), null);
    await set(ref(db, `userBroadcasts/${uid}/${channelId}`), null);
  }

  async sendMessage(channelId: string, message: Partial<Message>): Promise<void> {
    const messagesRef = ref(db, `broadcastMessages/${channelId}`);
    const newMessageRef = push(messagesRef);
    const msgId = newMessageRef.key!;

    const msgData = {
      ...message,
      id: msgId,
      timestamp: serverTimestamp(),
      deletedFor: {}
    };

    await set(newMessageRef, msgData);

    // Mention Detection & Notification
    if (msgData.text && msgData.text.includes('@')) {
      const mentions = msgData.text.match(/@(\w+)/g);
      if (mentions) {
        const usersRef = ref(db, 'users');
        for (const mention of mentions) {
          const handle = mention.slice(1);
          const q = query(usersRef, orderByChild('handle'), equalTo(handle));
          const snapshot = await get(q);
          
          if (snapshot.exists()) {
            const usersObj = snapshot.val();
            const mentionedUid = Object.keys(usersObj)[0];
            if (mentionedUid !== message.sender) {
              const notifRef = push(ref(db, `notifications/${mentionedUid}`));
              await set(notifRef, {
                type: 'mention',
                title: 'New Mention',
                message: `${message.senderName || 'Broadcast'} mentioned you in a channel: "${msgData.text.substring(0, 50)}${msgData.text.length > 50 ? '...' : ''}"`,
                timestamp: Date.now(),
                read: false,
                link: `/broadcast/${channelId}`,
                sender: {
                  name: message.senderName || 'Broadcast',
                  photoURL: ''
                }
              });
            }
          }
        }
      }
    }
  }

  listenChannels(uid: string, callback: (channels: Broadcast[]) => void): () => void {
    const userBroadcastsRef = ref(db, `userBroadcasts/${uid}`);
    let channelListeners: Record<string, () => void> = {};
    let channelsMap: Record<string, Broadcast> = {};

    const unsubUserBroadcasts = onValue(userBroadcastsRef, (snap) => {
      const currentChannelIds = snap.exists() ? Object.keys(snap.val()) : [];
      
      // Remove listeners for channels we are no longer part of
      Object.keys(channelListeners).forEach(id => {
        if (!currentChannelIds.includes(id)) {
          channelListeners[id]();
          delete channelListeners[id];
          delete channelsMap[id];
        }
      });

      // Add listeners for new channels
      currentChannelIds.forEach(id => {
        if (!channelListeners[id]) {
          const channelRef = ref(db, `broadcasts/${id}`);
          channelListeners[id] = onValue(channelRef, (channelSnap) => {
            if (channelSnap.exists()) {
              channelsMap[id] = { ...channelSnap.val(), id } as Broadcast;
            } else {
              delete channelsMap[id];
            }
            callback(Object.values(channelsMap));
          }, (err) => {
            const message = err instanceof Error ? err.message : String(err);
            if (!/permission|denied/i.test(message)) {
              console.error(`Error listening to broadcast ${id}:`, err);
            }
          });
        }
      });

      if (currentChannelIds.length === 0) {
        callback([]);
      }
    }, (err) => {
      const message = err instanceof Error ? err.message : String(err);
      if (!/permission|denied/i.test(message)) {
        console.error('listenChannels error:', err);
      }
      callback([]);
    });

    return () => {
      unsubUserBroadcasts();
      Object.values(channelListeners).forEach(unsub => unsub());
    };
  }
}
