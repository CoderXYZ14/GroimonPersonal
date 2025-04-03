import { NextResponse } from "next/server";

export async function middleware(request) {
  const url = request.nextUrl;

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname === "/your_insta_token"
  ) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/dashboard")) {
    const userDetails = request.cookies.get("user_details")?.value;
    if (!userDetails) {
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
