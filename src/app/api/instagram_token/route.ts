import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import UserModel from "@/models/User";

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

    const shortLivedAccessToken = response?.data.access_token;

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
    const longLivedAccessToken = longLivedTokenResponse?.data.access_token;

    const detailsResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/insta_details`,
      {
        accessToken: longLivedAccessToken,
      }
    );

    const { user_id, username } = detailsResponse.data;

    const user = await UserModel.findByIdAndUpdate(
      "67d7ad008e6101562691c63e",
      {
        instagramAccessToken: longLivedAccessToken,
        instagramId: user_id,
        instagramUsername: username,
      },
      {
        new: true,
        select:
          "_id name email image provider instagramId instagramUsername instagramAccessToken",
      }
    );

    return NextResponse.json({
      user,
      tokenData: longLivedTokenResponse.data,
    });
  } catch (error) {
    console.error("Detailed error:", error);

    if (error instanceof AxiosError) {
      console.error(
        "Instagram API Error:",
        error.response?.data || error.message
      );

      const errorResponse: ErrorResponse = {
        error:
          (error.response?.data as string) || "Instagram API error occurred",
        status: error.response?.status,
      };

      return NextResponse.json(errorResponse, {
        status: error.response?.status || 500,
      });
    } else if (error instanceof Error && error.name === "MongooseError") {
      console.error("MongoDB Error:", error.message);
      const errorResponse: ErrorResponse = {
        error: "Database operation timed out. Please try again.",
        status: 503,
      };
      return NextResponse.json(errorResponse, { status: 503 });
    } else {
      console.error("Unknown error:", error);
      const errorResponse: ErrorResponse = {
        error: "An unknown error occurred",
        status: 500,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  }
}
