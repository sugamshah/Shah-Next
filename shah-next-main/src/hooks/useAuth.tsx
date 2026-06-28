'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { services } from '@/services/container';
import type { User } from '@/domain/entities';

const setSessionCookie = (name: string, value: string | null, days = 1) => {
  if (typeof document === 'undefined') return;
  if (!value) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; Path=/; Expires=${expires}; SameSite=Lax`;
};

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let safetyTimeout: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = services.auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);

      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }

      safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (firebaseUser) {
        setSessionCookie('shah-auth', firebaseUser.uid);
        unsubProfile = services.user.listenToUserProfile(firebaseUser.uid, (userProfile) => {
          setProfile(userProfile);
          if (userProfile?.ban?.isBanned || userProfile?.banned) {
            setSessionCookie('shah-banned', '1');
          } else {
            setSessionCookie('shah-banned', null);
          }
          setLoading(false);
          if (safetyTimeout) {
            clearTimeout(safetyTimeout);
          }
        });
      } else {
        setSessionCookie('shah-auth', null);
        setSessionCookie('shah-banned', null);
        setProfile(null);
        setLoading(false);
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
      if (safetyTimeout) clearTimeout(safetyTimeout);
    };
  }, []);

  const handleSignOut = async () => {
    setSessionCookie('shah-auth', null);
    setSessionCookie('shah-banned', null);
    await services.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
