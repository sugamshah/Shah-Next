import { ref, get, set, onValue } from 'firebase/database';
import { db } from '../firebase/config';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'super_admin' | 'moderator';
  verified: boolean;
  twoFactorEnabled: boolean;
  createdAt: number;
  lastLogin: number;
  permissions: string[];
}

export interface AdminLoginAttempt {
  uid: string;
  timestamp: number;
  success: boolean;
  ip?: string;
}

export class FirebaseAdminService {
  async isAdmin(uid: string): Promise<boolean> {
    try {
      const adminRef = ref(db, `admins/${uid}`);
      const snapshot = await get(adminRef);
      return snapshot.exists() && snapshot.val().verified === true;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }

  async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      const adminRef = ref(db, `admins/${uid}`);
      const snapshot = await get(adminRef);
      return snapshot.exists() ? (snapshot.val() as AdminUser) : null;
    } catch (err) {
      console.error('Error fetching admin user:', err);
      return null;
    }
  }

  async logAdminLogin(uid: string, success: boolean): Promise<void> {
    try {
      const logsRef = ref(db, `adminLogs/logins/${Date.now()}`);
      await set(logsRef, {
        uid,
        timestamp: Date.now(),
        success,
      });
    } catch (err) {
      console.error('Error logging admin login:', err);
    }
  }

  async getRealTimeStats(callback: (stats: any) => void): Promise<() => void> {
    const statsRef = ref(db, 'stats');
    const unsubscribe = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
    return unsubscribe;
  }

  async getRecentReports(callback: (reports: any[]) => void): Promise<() => void> {
    const reportsRef = ref(db, 'reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reportsObj = snapshot.val();
        const reportsList = Object.entries(reportsObj).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        callback(reportsList.slice(0, 50)); // Last 50 reports
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  }

  async banUser(uid: string, reason: string, duration: number): Promise<void> {
    try {
      const banExpiry = duration === 0 ? 0 : Date.now() + duration;
      await set(ref(db, `banned/${uid}`), {
        reason,
        bannedAt: Date.now(),
        banExpiresAt: banExpiry,
        permanent: duration === 0,
      });
      
      // Log the action
      await set(ref(db, `adminLogs/bans/${Date.now()}`), {
        uid,
        reason,
        banExpiry,
      });
    } catch (err) {
      console.error('Error banning user:', err);
      throw err;
    }
  }

  async unbanUser(uid: string): Promise<void> {
    try {
      await set(ref(db, `banned/${uid}`), null);
      await set(ref(db, `adminLogs/unbans/${Date.now()}`), { uid });
    } catch (err) {
      console.error('Error unbanning user:', err);
      throw err;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      await set(ref(db, `reports/${reportId}`), null);
    } catch (err) {
      console.error('Error deleting report:', err);
      throw err;
    }
  }

  async handleReportVerdict(reportId: string, verdict: 'approved' | 'rejected', actionTaken: string): Promise<void> {
    try {
      await set(ref(db, `reports/${reportId}/verdict`), {
        verdict,
        actionTaken,
        handledAt: Date.now(),
      });
    } catch (err) {
      console.error('Error handling report verdict:', err);
      throw err;
    }
  }

  async getSystemHealth(callback: (health: any) => void): Promise<() => void> {
    const healthRef = ref(db, 'systemHealth');
    const unsubscribe = onValue(healthRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
    return unsubscribe;
  }
}

export const adminService = new FirebaseAdminService();
