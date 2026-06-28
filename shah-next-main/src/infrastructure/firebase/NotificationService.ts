import { ref, push, set, onValue, update, get } from 'firebase/database';
import { db } from './config';

export interface Notification {
  id?: string;
  type: 'message' | 'mention' | 'group_invite' | 'broadcast_invite' | 'friend_request' | 'group_update';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  link?: string;
  sender?: {
    uid?: string;
    name?: string;
    photoURL?: string;
  };
}

export class FirebaseNotificationService {
  async sendNotification(userId: string, notification: Omit<Notification, 'id'>): Promise<void> {
    try {
      const notifRef = push(ref(db, `notifications/${userId}`));
      await set(notifRef, {
        ...notification,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Error sending notification:', err);
      throw err;
    }
  }

  listenNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const notifRef = ref(db, `notifications/${userId}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsObj = snapshot.val();
        const notificationsList = Object.entries(notificationsObj)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data,
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        callback(notificationsList);
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  }

  listenUnreadNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const notifRef = ref(db, `notifications/${userId}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsObj = snapshot.val();
        const unreadList = Object.entries(notificationsObj)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data,
          }))
          .filter((n) => !n.read)
          .sort((a, b) => b.timestamp - a.timestamp);
        callback(unreadList);
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await update(ref(db, `notifications/${userId}/${notificationId}`), {
        read: true,
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifRef = ref(db, `notifications/${userId}`);
      const snapshot = await get(notifRef);
      if (snapshot.exists()) {
        const notificationsObj = snapshot.val();
        const updates: Record<string, boolean> = {};
        Object.keys(notificationsObj).forEach((key) => {
          updates[`${key}/read`] = true;
        });
        await update(notifRef, updates);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      await set(ref(db, `notifications/${userId}/${notificationId}`), null);
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }

  async clearAllNotifications(userId: string): Promise<void> {
    try {
      await set(ref(db, `notifications/${userId}`), null);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      throw err;
    }
  }
}

export const notificationService = new FirebaseNotificationService();
