import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './config';
import type { IAuthService } from '../../domain/repositories/interfaces';
import { S7Security } from '../../lib/security';

export class FirebaseAuthService implements IAuthService {
  constructor() {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Unable to set auth persistence:', error);
    });
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  async signIn(email: string, password: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!S7Security.validatePayload({ email: normalizedEmail, password })) {
      throw new Error('Invalid credentials payload');
    }
    if (!S7Security.checkRateLimit(`auth:${normalizedEmail}`)) {
      throw new Error('Too many attempts. Please wait a moment before trying again.');
    }
    return await signInWithEmailAndPassword(auth, normalizedEmail, password);
  }

  async signUp(email: string, password: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error('Password must be at least 8 characters and include a number and uppercase letter.');
    }
    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    if (result.user) {
      await sendEmailVerification(result.user);
    }
    return result;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async updateProfile(name: string, photoURL: string): Promise<void> {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name, photoURL });
    }
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  }

  async sendVerificationEmail(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
