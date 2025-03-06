
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "./AuthModal";
import { Loader2 } from "lucide-react";
import { useTaskStore } from "@/lib/taskStore";

interface LoginGateProps {
  children: React.ReactNode;
}

const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { syncWithSupabase } = useTaskStore();
  
  useEffect(() => {
    // If user is not loading and not logged in, show the auth modal
    if (!isLoading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
      
      // Try to sync with Supabase as soon as user is authenticated
      // This ensures we have data even if local storage fails
      try {
        syncWithSupabase(user.id);
      } catch (error) {
        console.error("Failed to sync with Supabase in LoginGate:", error);
      }
    }
  }, [user, isLoading, syncWithSupabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-purple-500 animate-spin mx-auto" />
          <p className="mt-4 text-purple-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
          <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-purple-200 max-w-md w-full">
            <h1 className="text-3xl font-bold text-purple-800 mb-4">Welcome to Taskush</h1>
            <p className="text-purple-600 mb-6">Please sign in to access your tasks</p>
            <AuthModal isOpen={showAuthModal} onClose={() => {}} />
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default LoginGate;
