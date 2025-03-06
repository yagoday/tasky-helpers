
import React from "react";

interface LoginGateProps {
  children: React.ReactNode;
}

// Temporarily bypassing all authentication to focus on database connection
const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  console.log("Authentication bypassed temporarily");
  
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          Auth Disabled Temporarily
        </div>
      </div>
      {children}
    </>
  );
};

export default LoginGate;
