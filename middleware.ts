import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function runs before the route is processed
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard, /dashboard/settings)
  const path = request.nextUrl.pathname;
  
  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/dashboard/automation"];
  
  // Check if the current path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // Get the user_details cookie
    const userCookie = request.cookies.get("user_details");
    
    // If the cookie doesn't exist or is empty, redirect to signin
    if (!userCookie || !userCookie.value) {
      // Create the URL to redirect to
      const signinUrl = new URL("/signin", request.url);
      
      // Return the redirect response
      return NextResponse.redirect(signinUrl);
    }
  }
  
  // If the user is authenticated or it's not a protected route, continue
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"]
};
