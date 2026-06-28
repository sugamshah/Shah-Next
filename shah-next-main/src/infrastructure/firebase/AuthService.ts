import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config';
import { IAuthService } from '../../domain/repositories/interfaces';

export class FirebaseAuthService implements IAuthService {
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  async signIn(email: string, password: string): Promise<any> {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async signUp(email: string, password: string): Promise<any> {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async updateProfile(name: string, photoURL: string): Promise<void> {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name, photoURL });
    }
  }
}
