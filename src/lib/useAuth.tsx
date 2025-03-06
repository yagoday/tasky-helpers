
import { createContext, useContext } from "react";
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

// Create a mock user for development without authentication
const mockUser = {
  id: "mock-user-id",
  email: "mock-user@example.com",
} as User;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Provide a mock implementation that bypasses actual authentication
  const mockAuthValue: AuthContextType = {
    supabase,
    user: mockUser,
    session: null,
    isLoading: false,
    signIn: () => {
      toast.info("Auth is temporarily disabled");
      console.log("Auth is temporarily disabled");
    },
    signInWithGoogle: () => {
      toast.info("Auth is temporarily disabled");
      console.log("Auth is temporarily disabled");
    },
    signOut: () => {
      toast.info("Auth is temporarily disabled");
      console.log("Auth is temporarily disabled");
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
