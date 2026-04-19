"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import {
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  devBypass: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

const bypass =
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true" ||
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "1";

const mockDevUser = {
  uid: "dev-local",
  email: "dev@local.test",
  emailVerified: true,
} as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    bypass ? mockDevUser : null,
  );
  const [loading, setLoading] = useState(() => {
    if (bypass) return false;
    return isFirebaseConfigured();
  });

  useEffect(() => {
    if (bypass) return;
    if (!isFirebaseConfigured()) return;

    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth is not configured.");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth is not configured.");
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOutFn = useCallback(async () => {
    if (bypass) return;
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: bypass ? mockDevUser : user,
      loading: bypass ? false : loading,
      devBypass: bypass,
      signInEmail,
      signUpEmail,
      signOut: signOutFn,
    }),
    [user, loading, signInEmail, signUpEmail, signOutFn],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
