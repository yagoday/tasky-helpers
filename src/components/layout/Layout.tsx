
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useState, useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useTaskStore } from "@/lib/taskStore";
import { toast } from "sonner";
import { supabase } from "@/lib/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const { syncWithSupabase, initializeTables } = useTaskStore();
  
  useEffect(() => {
    if (user) {
      try {
        // Check if we need to create database tables
        checkAndSetupTables(user.id);
      } catch (error) {
        console.error("Error in Layout useEffect:", error);
        toast.error("An error occurred while setting up the application");
      }
    }
  }, [user]);

  const checkAndSetupTables = async (userId: string) => {
    try {
      // First check if the RPC functions exist
      const { error: rpcCheckError } = await supabase.rpc('check_function_exists', { function_name: 'create_tasks_table' });
      
      // If the RPC functions don't exist, guide the user to create them
      if (rpcCheckError) {
        console.error("RPC functions not found:", rpcCheckError);
        
        toast.error("Database setup required", {
          description: "Please create the necessary tables in your Supabase dashboard.",
          duration: 8000,
          action: {
            label: "Show Instructions",
            onClick: () => showDatabaseSetupInstructions(),
          },
        });
        return;
      }
      
      // If RPC functions exist, proceed with initialization
      await initializeTables(userId);
      // Then sync data
      await syncWithSupabase(userId);
    } catch (error) {
      console.error("Error checking/setting up tables:", error);
    }
  };

  const showDatabaseSetupInstructions = () => {
    toast.info(
      <div className="space-y-2">
        <p className="font-medium">Database Setup Instructions:</p>
        <p>Create these tables in your Supabase SQL Editor:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li><strong>tasks</strong> table with columns: id, title, completed, due_date, created_at, user_id, labels_string</li>
          <li><strong>labels</strong> table with columns: id, name, color, user_id</li>
        </ol>
        <p className="text-xs mt-2">Note: The labels_string column in tasks should be text that stores comma-separated label IDs.</p>
      </div>,
      {
        duration: 15000,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 antialiased">
      <header className="border-b border-purple-200 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-purple-800">Taskush</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full h-9 w-9 hover:bg-purple-100"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <User className="h-5 w-5 text-purple-600" />
          </Button>
        </div>
      </header>
      
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        {children}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Layout;
