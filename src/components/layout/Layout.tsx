
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useTaskStore } from "@/lib/taskStore";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const { syncWithSupabase } = useTaskStore();
  
  useEffect(() => {
    if (user) {
      syncWithSupabase(user.id);
    }
  }, [user, syncWithSupabase]);

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
