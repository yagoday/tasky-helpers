
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "./AuthModal";
import { Loader2 } from "lucide-react";
import { useTaskStore } from "@/lib/taskStore";
import { toast } from "sonner";

interface LoginGateProps {
  children: React.ReactNode;
}

const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { syncWithSupabase } = useTaskStore();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);
  
  // Add more detailed logging
  useEffect(() => {
    console.log("LoginGate: Auth state update", { 
      isLoading, 
      userExists: !!user, 
      syncAttempted,
      syncError: syncError?.message 
    });
  }, [user, isLoading, syncAttempted, syncError]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setShowAuthModal(true);
        setSyncAttempted(false); // Reset sync attempted when user logs out
      } else {
        setShowAuthModal(false);
        
        // Only try to sync once when user is authenticated
        if (!syncAttempted) {
          console.log("LoginGate: Attempting to sync with Supabase for user", user.id);
          setSyncAttempted(true);
          
          // Using a try-catch to better handle errors
          try {
            // Wrap in a timeout to avoid blocking the UI thread
            setTimeout(() => {
              syncWithSupabase(user.id)
                .then(() => {
                  console.log("LoginGate: Sync with Supabase successful");
                  setSyncError(null);
                })
                .catch(error => {
                  console.error("LoginGate: Error syncing with Supabase:", error);
                  setSyncError(error);
                  toast.error("Failed to sync your data. Please try refreshing the page.");
                });
            }, 100);
          } catch (error) {
            console.error("LoginGate: Unexpected error during sync:", error);
            setSyncError(error instanceof Error ? error : new Error(String(error)));
          }
        }
      }
    }
  }, [user, isLoading, syncWithSupabase, syncAttempted]);

  // If we're still loading, show the loading indicator
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

  // If the user is not authenticated, show the auth screen
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

  // If there was an error syncing, show an error message with a retry button
  if (syncError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-purple-200 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Sync Error</h1>
          <p className="text-gray-700 mb-6">There was a problem loading your data: {syncError.message}</p>
          <Button 
            onClick={() => {
              setSyncAttempted(false);
              setSyncError(null);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If everything is good, render the children
  return <>{children}</>;
};

const Button = ({ children, onClick, className }: { 
  children: React.ReactNode, 
  onClick: () => void,
  className?: string
}) => (
  <button
    className={className}
    onClick={onClick}
  >
    {children}
  </button>
);

export default LoginGate;
