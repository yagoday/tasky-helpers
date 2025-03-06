
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-purple-200 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-purple-800">404</h1>
        <p className="text-xl text-purple-600 mb-6">Oops! Page not found</p>
        <Button asChild className="bg-purple-500 hover:bg-purple-600">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
