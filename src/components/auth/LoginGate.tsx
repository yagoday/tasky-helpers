
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { useEffect } from "react";

interface LoginGateProps {
  children: React.ReactNode;
}

// Completely bypassing all authentication to focus on database connection
const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const { syncWithSupabase } = useTaskStore();
  
  useEffect(() => {
    // Initialize with mock data in offline mode
    console.log("Authentication completely bypassed - running in offline mode");
    syncWithSupabase();
  }, [syncWithSupabase]);
  
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          Auth Disabled - Offline Mode
        </div>
      </div>
      {children}
    </>
  );
};

export default LoginGate;
