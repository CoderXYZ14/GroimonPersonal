import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const isProduction = hostname === "groimon.com";

  if (isProduction && url.pathname === "/redirect") {
    return NextResponse.redirect(
      new URL("https://redirect.groimon.com", request.url)
    );
  }

  if (isProduction && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(
      new URL(`https://app.groimon.com${url.pathname}`, request.url)
    );
  }

  // if (url.pathname.startsWith("/dashboard")) {
  //   const userDetails = request.cookies.get("user_details")?.value;
  //   if (!userDetails) {
  //     return NextResponse.redirect(new URL("/signin", request.url));
  //   }
  // }

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
    "/redirectpage",
  ],
};
