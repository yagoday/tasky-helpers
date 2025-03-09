
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

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get the Supabase URL and anon key from environment variables
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file");
    toast.error("Supabase configuration missing. Check console for details.");
  }
  
  return {
    supabaseUrl,
    supabaseAnonKey
  };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Create a singleton instance of the Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as SupabaseClient; // This cast is to prevent TypeScript errors, but the app will show an error message

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      setIsLoading(false);
      return;
    }

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

  // Display an error message if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="flex items-center justify-center h-screen flex-col p-4">
        <div className="w-full max-w-md p-8 space-y-4 rounded-2xl border border-red-200 bg-white/90 backdrop-blur-sm shadow-sm text-center">
          <h2 className="text-2xl font-bold tracking-tight text-red-800">Configuration Error</h2>
          <p className="mt-2 text-red-600">
            Missing Supabase configuration. Please set up your environment variables.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left text-sm">
            <p className="font-medium">Create a <code className="bg-gray-100 p-1 rounded">.env</code> file in the root directory with:</p>
            <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto">
              VITE_SUPABASE_URL=your-supabase-project-url{"\n"}
              VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
            </pre>
            <p className="mt-2 text-xs text-gray-600">
              <strong>Important:</strong> The <code>.env</code> file should be added to <code>.gitignore</code> to prevent committing secrets to your repository.
              Use <code>.env.example</code> as a template for required variables without actual values.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
