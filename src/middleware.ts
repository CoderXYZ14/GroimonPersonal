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
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/",
    "/dashboard/:path*",
    "/verify/:path*",
    "/your_insta_token",
  ],
};
