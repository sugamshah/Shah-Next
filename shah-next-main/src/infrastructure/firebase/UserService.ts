import { 
  ref, 
  get, 
  set, 
  update, 
  onValue, 
  query, 
  orderByChild, 
  equalTo,
  push
} from 'firebase/database';
import { db } from './config';
import type { IUserService } from '../../domain/repositories/interfaces';
import type { User } from '../../domain/entities';

export class FirebaseUserService implements IUserService {
  async getUserProfile(uid: string): Promise<User | null> {
    const snap = await get(ref(db, `users/${uid}`));
    if (snap.exists()) {
      const data = snap.val() as User;
      return { ...data, uid: data.uid || uid };
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    const snap = await get(ref(db, 'users'));
    if (!snap.exists()) {
      return [];
    }

    return Object.entries(snap.val() as Record<string, User>).map(([uid, data]) => ({
      ...data,
      uid: data.uid || uid,
    }));
  }

  async saveUserProfile(user: User): Promise<void> {
    await set(ref(db, `users/${user.uid}`), user);
  }

  async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    await update(ref(db, `users/${uid}`), updates);
  }

  async findUserByJgId(jgId: string): Promise<User | null> {
    const usersQuery = query(ref(db, 'users'), orderByChild('jgId'), equalTo(jgId));
    const snap = await get(usersQuery);
    if (snap.exists()) {
      const users = snap.val();
      const uid = Object.keys(users)[0];
      return { ...users[uid], uid } as User;
    }
    return null;
  }

  listenToUserProfile(uid: string, callback: (user: User | null) => void): () => void {
    const userRef = ref(db, `users/${uid}`);
    return onValue(userRef, (snap) => {
      callback(snap.exists() ? (snap.val() as User) : null);
    }, (err) => {
      const message = err instanceof Error ? err.message : String(err);
      if (!/permission|denied/i.test(message)) {
        console.error('listenToUserProfile error:', err);
      }
      callback(null);
    });
  }

  async getBlockedUsers(uid: string): Promise<string[]> {
    const snap = await get(ref(db, `users/${uid}/blocked`));
    return snap.exists() ? Object.keys(snap.val()) : [];
  }

  async toggleBlockUser(uid: string, targetUid: string): Promise<void> {
    const blockRef = ref(db, `users/${uid}/blocked/${targetUid}`);
    const snap = await get(blockRef);
    if (snap.exists()) {
      await set(blockRef, null);
    } else {
      await set(blockRef, true);
    }
  }

  async updateUserStatus(uid: string, status: User['status']): Promise<void> {
    await update(ref(db, `users/${uid}`), { status });
  }

  async sendRequest(uid: string, targetUser: User): Promise<void> {
    if (!uid || !targetUser?.uid || uid === targetUser.uid) {
      throw new Error('Invalid friend request details.');
    }

    const userRef = ref(db, `users/${uid}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) {
      throw new Error('Sender profile not found.');
    }

    const userData = userSnap.val() as User;
    const targetContact = await get(ref(db, `users/${targetUser.uid}/contacts/${uid}`));
    if (targetContact.exists()) {
      throw new Error('You are already friends with this user.');
    }

    const blockedByTarget = await get(ref(db, `users/${targetUser.uid}/blocked/${uid}`));
    const blockedBySender = await get(ref(db, `users/${uid}/blocked/${targetUser.uid}`));
    if (blockedByTarget.exists() || blockedBySender.exists()) {
      throw new Error('Unable to send request due to block settings.');
    }

    const existingRequest = await get(ref(db, `requests/${targetUser.uid}/${uid}`));
    if (existingRequest.exists()) {
      throw new Error('Friend request already sent.');
    }

    await set(ref(db, `requests/${targetUser.uid}/${uid}`), {
      uid,
      senderName: userData.name,
      senderJgId: userData.jgId,
      senderPhotoURL: userData.photoURL || null,
      timestamp: Date.now(),
      status: 'pending'
    });

    // Add notification
    const notifRef = push(ref(db, `notifications/${targetUser.uid}`));
    await set(notifRef, {
      type: 'friend_request',
      title: 'Friend Request',
      message: `${userData.name} (@${userData.handle || userData.jgId}) sent you a friend request.`,
      timestamp: Date.now(),
      read: false,
      link: '/requests',
      sender: {
        uid,
        name: userData.name,
        photoURL: userData.photoURL || ''
      }
    });
  }

  async reportUser(reportedUid: string, reporterUid: string, reason: string, reportType: string): Promise<void> {
    const reportRef = push(ref(db, 'reports'));
    const { serverTimestamp } = await import('firebase/database');
    await set(reportRef, {
      reportedUid,
      reporterUid,
      reason,
      reportType, // 'user_harassment', 'user_spam', 'user_inappropriate', etc.
      timestamp: serverTimestamp(),
      status: 'pending'
    });
  }
}

