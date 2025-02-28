import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const payload = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
      grant_type: "authorization_code"!,
      redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URLL}/your_insta_token`,
      code,
    });

    const response = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const shortLivedAccessToken = response.data.access_token;

    //long term token
    const longLivedTokenResponse = await axios.get(
      `https://graph.instagram.com/access_token`,
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret:
            process.env.NEXT_PUBLIC_NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET,
          access_token: shortLivedAccessToken,
        },
      }
    );

    return NextResponse.json(longLivedTokenResponse.data);
  } catch (error: any) {
    console.error(
      "Instagram API Error:",
      error.response?.data || error.message
    ); // Debugging log
    return NextResponse.json(
      { error: error.response?.data || "Something went wrong" },
      { status: error.response?.status || 500 }
    );
  }
}
