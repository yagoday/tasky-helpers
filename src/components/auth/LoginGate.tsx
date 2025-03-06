
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { useEffect } from "react";

interface LoginGateProps {
  children: React.ReactNode;
}

// Using proper UUID for mock user
const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const { syncWithSupabase } = useTaskStore();
  
  useEffect(() => {
    // Initialize with mock data using proper UUID
    console.log("Authentication bypassed - running in offline mode");
    syncWithSupabase("123e4567-e89b-12d3-a456-426614174000");
  }, [syncWithSupabase]);
  
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          Auth Disabled - Connected to DB
        </div>
      </div>
      {children}
    </>
  );
};

export default LoginGate;
