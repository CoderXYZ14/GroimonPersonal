"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { useAppSelector } from "@/redux/hooks";
import { parseCookies } from "nookies";

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    // Check for authentication
    const checkAuth = () => {
      // First check Redux store
      if (user?.instagramId) {
        return true;
      }
      
      // Fallback to cookie check
      const cookies = parseCookies();
      const userDetailsCookie = cookies.user_details;
      
      if (!userDetailsCookie) {
        console.log("No authentication found, redirecting to signin");
        router.replace("/signin");
        return false;
      }
      
      return true;
    };

    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
  }, [router, user]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BeatLoader color="#1A69DD" size={12} />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
