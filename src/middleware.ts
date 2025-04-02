import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

export async function middleware(request) {
  const url = request.nextUrl;
  // Allow all API routes and Instagram callback
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname === "/your_insta_token"
  ) {
    return NextResponse.next();
  }
  // Check if user is accessing dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
    // Get authentication state from cookies
    const token = await getToken({ req: request });
    const userDetails = request.cookies.get("user_details")?.value;
    const isAuthenticated = token || userDetails;
    if (!isAuthenticated) {
      // Store the attempted URL to redirect back after auth
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.set("redirectTo", url.pathname, { path: "/" });
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/", "/dashboard/:path*", "/verify/:path*"],
};
