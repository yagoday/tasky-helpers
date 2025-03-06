
import { useState, createContext, useContext, useEffect } from "react";
import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: () => void;
  signInWithGoogle: () => void;
  signOut: () => void;
};

// The only allowed email address
const ALLOWED_EMAIL = "yaron.yagoda@gmail.com";

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
      
      if (session?.user && session.user.email !== ALLOWED_EMAIL) {
        // If a non-allowed user somehow got a session, sign them out
        await supabase.auth.signOut();
        toast.error("Unauthorized access. Only the app owner can sign in.");
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user || null);
      }
      
      setIsLoading(false);
    };

    getSession();

    // Handle auth state changes and OAuth redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        // Check if the user is allowed when auth state changes
        if (currentSession?.user && currentSession.user.email !== ALLOWED_EMAIL) {
          // If not allowed, sign them out immediately
          await supabase.auth.signOut();
          toast.error("Unauthorized access. Only the app owner can sign in.");
          setSession(null);
          setUser(null);
        } else {
          if (event === "SIGNED_IN") {
            toast.success("Successfully signed in!");
          }
          
          if (event === "SIGNED_OUT") {
            toast.success("Successfully signed out!");
          }
          
          setSession(currentSession);
          setUser(currentSession?.user || null);
        }
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
    try {
      // Use the current hostname/origin for the redirect
      // This ensures it works both locally and in production
      const currentSiteUrl = window.location.origin;
      console.log("Current site URL for redirect:", currentSiteUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${currentSiteUrl}/auth/callback`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });

      if (error) {
        if (error.message.includes("provider is not enabled")) {
          toast.error("Google sign-in is not enabled. Please configure the Google provider in your Supabase project.");
          console.error("Google provider not enabled in Supabase. Enable it in the Supabase dashboard:", error);
        } else {
          toast.error("Error signing in with Google");
          console.error("Error signing in with Google:", error);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred during sign-in");
      console.error("Unexpected error during sign-in:", error);
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
