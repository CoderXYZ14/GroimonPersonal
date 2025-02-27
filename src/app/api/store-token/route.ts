// app/api/store-token/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { accessToken } = await request.json();

  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set("instagram_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error storing access token:", error);
    return NextResponse.json(
      { error: "Failed to store access token" },
      { status: 500 }
    );
  }
}
