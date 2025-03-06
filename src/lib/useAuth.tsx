
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

// Create a mock user with proper UUID format for development without authentication
const mockUser = {
  id: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID format
  email: "mock-user@example.com",
} as User;

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
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          // Use mock user when no real session exists
          setUser(mockUser);
          
          // For development, create a mock session that works with RLS
          await supabase.auth.signInWithPassword({
            email: 'mock-user@example.com',
            password: 'password123',
          }).catch(() => {
            // If sign-in fails, we're in development mode without real auth
            console.log("Using mock authentication");
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback to mock user
        setUser(mockUser);
        setIsLoading(false);
      }
    };

    // Set up auth state listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? mockUser);
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
      await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'demopassword',
      });
      toast.success("Signed in successfully");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
      // Fall back to mock user
      setUser(mockUser);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
      // Fall back to mock user
      setUser(mockUser);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
