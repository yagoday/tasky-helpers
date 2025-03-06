
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

interface LoginGateProps {
  children: React.ReactNode;
}

const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const { syncWithSupabase } = useTaskStore();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      console.log("Syncing with Supabase for user:", user.id);
      syncWithSupabase(user.id);
    } else {
      console.log("No authenticated user found");
    }
  }, [user, syncWithSupabase]);
  
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
