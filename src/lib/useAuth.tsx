
import { createContext, useContext, useState, useEffect } from "react";
import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

// Create a singleton instance of the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
      try {
        // Check for existing session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    // Set up auth state listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setIsLoading(false);
      }
    );
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'demopassword',
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Signed in successfully");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.info("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const authValue: AuthContextType = {
    supabase,
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
