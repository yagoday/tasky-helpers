
import { useState, createContext, useContext, useEffect } from "react";
import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: () => void;
  signInWithGoogle: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY || ""
  );
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
      }
      
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === "SIGNED_IN") {
          toast.success("Successfully signed in!");
        }
        
        if (event === "SIGNED_OUT") {
          toast.success("Successfully signed out!");
        }
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async () => {
    // TODO: implement email sign in
    // Placeholder for future implementation
    toast.info("Email sign in is not implemented yet");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error("Error signing in with Google");
      console.error("Error signing in with Google:", error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error("Error signing out");
      console.error("Error signing out:", error);
    }
  };

  const value = {
    supabase,
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
