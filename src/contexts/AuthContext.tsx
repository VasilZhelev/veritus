"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh ID token every 50 minutes (tokens expire after 1 hour)
  useEffect(() => {
    if (!user) return;

    const refreshToken = async () => {
      try {
        await user.getIdToken(true); // Force refresh
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };

    // Refresh immediately on mount
    refreshToken();

    // Set up interval to refresh every 50 minutes
    const interval = setInterval(refreshToken, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  }, [user]);

  const updateUserProfile = useCallback(async (profile: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error("No user is signed in");
    await updateProfile(user, profile);
  }, [user]);

  const changeEmail = useCallback(async (newEmail: string) => {
    if (!user) throw new Error("No user is signed in");
    await updateEmail(user, newEmail);
    // Send verification email for new email
    await sendEmailVerification(user);
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error("No user is signed in");
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  }, [user]);

  const deleteAccount = useCallback(async (password: string) => {
    if (!user || !user.email) throw new Error("No user is signed in");
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user account
    await deleteUser(user);
  }, [user]);

  const sendVerificationEmail = useCallback(async () => {
    if (!user) throw new Error("No user is signed in");
    await sendEmailVerification(user);
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    getIdToken,
    updateUserProfile,
    changeEmail,
    changePassword,
    deleteAccount,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

