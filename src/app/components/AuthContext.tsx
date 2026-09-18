import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "../../firebase";
import { toast } from "sonner";
import { api } from "../api";

export interface User {
  name: string;
  email: string;
  uid?: string;
  photoURL?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authMode: "login" | "signup" | "forgot";
  setAuthMode: (mode: "login" | "signup" | "forgot") => void;
  openAuthModal: (mode?: "login" | "signup" | "forgot") => void;
  closeAuthModal: () => void;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

function formatFirebaseError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please log in.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please reset your password or try again later.";
    case "auth/operation-not-allowed":
      return "This sign-in provider is not enabled yet in your Firebase Console (Authentication > Sign-in method).";
    default:
      return err?.message || "Authentication failed. Please try again.";
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [authError, setAuthError] = useState<string | null>(null);

  // Subscribe to Firebase Auth state listener on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken().catch(() => "");
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("firebase_token", token);
        }
        setUser({
          name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Shopper"),
          email: firebaseUser.email || "",
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        // Check if there is a legacy local backend user token
        const legacyToken = localStorage.getItem("token");
        const firebaseToken = localStorage.getItem("firebase_token");
        if (legacyToken && !firebaseToken) {
          try {
            const res = await api.getProfile();
            if (res.success && res.data) {
              setUser({ name: res.data.name, email: res.data.email });
            } else {
              localStorage.removeItem("token");
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("firebase_token", token);
      
      const displayName = userCredential.user.displayName || email.split("@")[0];
      setUser({
        name: displayName,
        email: userCredential.user.email || email,
        uid: userCredential.user.uid,
        photoURL: userCredential.user.photoURL,
      });
      
      toast.success(`Welcome back, ${displayName}! 👋`);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      const message = formatFirebaseError(err);
      setAuthError(message);
      toast.error(message);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() }).catch(() => {});
      }
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("firebase_token", token);

      setUser({
        name: name.trim() || email.split("@")[0],
        email: userCredential.user.email || email,
        uid: userCredential.user.uid,
        photoURL: userCredential.user.photoURL,
      });

      toast.success(`Account created successfully! Welcome, ${name.trim() || "Shopper"} 🎉`);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Firebase Signup Error:", err);
      const message = formatFirebaseError(err);
      setAuthError(message);
      toast.error(message);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("firebase_token", token);

      const displayName = result.user.displayName || result.user.email?.split("@")[0] || "Shopper";
      setUser({
        name: displayName,
        email: result.user.email || "",
        uid: result.user.uid,
        photoURL: result.user.photoURL,
      });

      toast.success(`Signed in with Google as ${displayName}! 👋`);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Firebase Google Auth Error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        return false;
      }
      const message = formatFirebaseError(err);
      setAuthError(message);
      toast.error(message);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success(`Password reset link sent to ${email.trim()}! Please check your inbox.`);
      setAuthMode("login");
      return true;
    } catch (err: any) {
      console.error("Firebase Reset Password Error:", err);
      const message = formatFirebaseError(err);
      setAuthError(message);
      toast.error(message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("firebase_token");
    setUser(null);
    toast.info("You have logged out.");
  };

  const openAuthModal = (mode: "login" | "signup" | "forgot" = "login") => {
    setAuthMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        resetPassword,
        logout,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
