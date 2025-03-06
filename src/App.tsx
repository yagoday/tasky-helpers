
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/useAuth";
import LoginGate from "@/components/auth/LoginGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Create a new 404 handling component for authentication redirects
const HandleAuthRedirect = () => {
  useEffect(() => {
    console.log("Handling auth callback redirect - this should be triggered after Google login");
    console.log("Current URL:", window.location.href);
    
    // Parse the URL hash if present
    if (window.location.hash) {
      console.log("Hash detected in URL:", window.location.hash);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.has('access_token')) {
        console.log("Access token found in URL hash, authentication successful");
      }
    }
    
    // If there are query parameters, log them too
    if (window.location.search) {
      console.log("Query params detected:", window.location.search);
    }
  }, []);
  
  return <Navigate to="/" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LoginGate>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Special route to handle authentication redirects */}
              <Route path="/auth/callback" element={<HandleAuthRedirect />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LoginGate>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
