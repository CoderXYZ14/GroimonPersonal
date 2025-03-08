import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface ErrorResponse {
  error: string;
  status?: number;
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const payload = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`,
      code,
    });

    const response = await axios.post<InstagramTokenResponse>(
      "https://api.instagram.com/oauth/access_token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const shortLivedAccessToken = response.data.access_token;

    // Long-term token request
    const longLivedTokenResponse = await axios.get<InstagramTokenResponse>(
      `https://graph.instagram.com/access_token`,
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
          access_token: shortLivedAccessToken,
        },
      }
    );

    return NextResponse.json(longLivedTokenResponse.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Instagram API Error:",
        error.response?.data || error.message
      );

      const errorResponse: ErrorResponse = {
        error: (error.response?.data as string) || "Something went wrong",
        status: error.response?.status,
      };

      return NextResponse.json(errorResponse, {
        status: error.response?.status || 500,
      });
    } else {
      console.error("Unknown error:", error);
      const errorResponse: ErrorResponse = {
        error: "An unknown error occurred",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  }
}
