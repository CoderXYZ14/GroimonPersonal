// File: app/api/instagram/token/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, appId } = body;

    // You'll need to store your app secret securely in environment variables on the server
    const appSecret = process.env.INSTAGRAM_APP_SECRET;

    // The redirect URI must exactly match what's registered in your Instagram app
    const redirectUri =
      "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/your_insta_token";

    const params = new URLSearchParams();
    params.append("client_id", appId);
    params.append("client_secret", appSecret || "");
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", redirectUri);
    params.append("code", code);

    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return NextResponse.json(tokenResponse.data);
  } catch (error: any) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        error: "Failed to exchange code for token",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
