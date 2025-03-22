import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

export async function middleware(request) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  const userDetails = request.cookies.get("user_details")?.value;
  const isInstagramAuthenticated =
    userDetails && JSON.parse(userDetails).provider === "instagram";

  const isAuthenticated = token || isInstagramAuthenticated;

  if (
    isAuthenticated &&
    (url.pathname.startsWith("/signin") || url.pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/dashboard/automation", request.url));
  }

  if (!isAuthenticated && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/", "/dashboard/:path*", "/verify/:path*"],
};
