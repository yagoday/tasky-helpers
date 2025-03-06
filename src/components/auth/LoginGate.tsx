
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

interface LoginGateProps {
  children: React.ReactNode;
}

const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const { syncWithSupabase } = useTaskStore();
  const { user, isLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  useEffect(() => {
    if (user) {
      console.log("Syncing with Supabase for user:", user.id);
      syncWithSupabase(user.id);
    } else {
      console.log("No authenticated user found");
    }
  }, [user, syncWithSupabase]);
  
  // Show a loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
          <p className="text-purple-800 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show auth modal
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md p-8 space-y-8 rounded-2xl border border-purple-200 bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-purple-800">Sign in to Taskush</h2>
            <p className="mt-2 text-purple-600">Please sign in to access your tasks</p>
          </div>
          <AuthModal 
            isOpen={true} 
            onClose={() => {}} 
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {user && (
          <>
            <div className="text-sm text-purple-700 hidden sm:block">
              {user.email}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 bg-white/80"
              onClick={() => setShowAuthModal(true)}
            >
              <UserRound className="h-4 w-4 mr-1.5 text-purple-500" />
              Account
            </Button>
          </>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {children}
    </>
  );
};

export default LoginGate;
