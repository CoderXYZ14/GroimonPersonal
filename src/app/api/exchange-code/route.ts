// app/api/exchange-code/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { code } = await request.json();

  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

  try {
    const response = await axios.post(
      `https://api.instagram.com/oauth/access_token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }
    );

    const { access_token } = response.data;

    return NextResponse.json({ accessToken: access_token });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { error: "Failed to exchange code for token" },
      { status: 500 }
    );
  }
}
