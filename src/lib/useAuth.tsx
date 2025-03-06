
import { createContext, useContext, useState, useEffect } from "react";
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

// Create a singleton instance of the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

// Create a mock user with proper UUID for development without authentication
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
    // Set up initial session
    setUser(mockUser);
    setIsLoading(false);

    // Set up auth state listener - this is commented out because we're using mock auth
    // But would be needed for real auth implementation
    /*
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
    */
  }, []);

  // Create special Supabase client that will work with RLS
  useEffect(() => {
    if (!user) return;
    
    // This is a workaround to make Supabase RLS work with our mock user
    const setupMockAuth = async () => {
      try {
        // Create a mock JWT that Supabase will accept
        // In a real implementation, we wouldn't need this hack
        await supabase.auth.setSession({
          access_token: 'mock-jwt-token',
          refresh_token: '',
        });
        
        // Then immediately set the user claims to match our mock user
        // @ts-ignore - this is a hack to make the mock user work with RLS
        supabase.auth.setAuth(mockUser.id);
        
        console.log("Mock authentication set up for RLS compatibility");
      } catch (error) {
        console.error("Error setting up mock auth:", error);
      }
    };
    
    setupMockAuth();
  }, [user]);

  // Provide a mock implementation that bypasses actual authentication
  const mockAuthValue: AuthContextType = {
    supabase,
    user: user,
    session: session,
    isLoading,
    signIn: () => {
      toast.info("Authentication is bypassed - running direct DB connection");
      console.log("Authentication is bypassed - DB connection enabled");
    },
    signInWithGoogle: () => {
      toast.info("Authentication is bypassed - running direct DB connection");
      console.log("Authentication is bypassed - DB connection enabled");
    },
    signOut: () => {
      toast.info("Authentication is bypassed - running direct DB connection");
      console.log("Authentication is bypassed - DB connection enabled");
    },
  };

  return <AuthContext.Provider value={mockAuthValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
