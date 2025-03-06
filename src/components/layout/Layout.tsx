
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 antialiased">
      <header className="border-b border-purple-200 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-purple-800">Taskush</h1>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
              Auth Disabled Temporarily
            </div>
          </div>
        </div>
      </header>
      
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
