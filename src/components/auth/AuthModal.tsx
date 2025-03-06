
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/useAuth";
import { Mail, LogOut, User } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, signIn, signInWithGoogle, signOut, isLoading } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl border border-purple-200 bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-purple-800">
            {user ? "Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription className="text-purple-600">
            {user 
              ? "You're currently signed in to Taskush"
              : "Sign in to access your tasks"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <User className="h-5 w-5 text-purple-500" />
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-purple-200 hover:bg-purple-50"
                onClick={() => {
                  signOut();
                  onClose();
                }}
              >
                <LogOut className="h-4 w-4 text-purple-500" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                className="w-full justify-start gap-2 bg-purple-100 text-purple-800 hover:bg-purple-200"
                onClick={() => {
                  signInWithGoogle();
                  onClose();
                }}
                disabled={isLoading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign in with Google
              </Button>
              
              <div className="text-xs text-purple-500 mt-1 px-2">
                <p>Note: You need to enable the Google provider in your Supabase project settings.</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-purple-200 hover:bg-purple-50"
                onClick={() => {
                  signIn();
                  onClose();
                }}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 text-purple-500" />
                Sign in with Email
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
