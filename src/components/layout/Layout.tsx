
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 antialiased">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        {children}
      </div>
    </div>
  );
};

export default Layout;
