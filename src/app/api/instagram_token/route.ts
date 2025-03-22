import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import UserModel from "@/models/User";

import dbConnect from "@/lib/dbConnect";
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
    await dbConnect();
    const { code, userId, isInstagramLogin } = await req.json();

    const payload = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`,
      code,
    });

    const tokenResponse = await axios.post<InstagramTokenResponse>(
      "https://api.instagram.com/oauth/access_token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const shortLivedAccessToken = tokenResponse?.data.access_token;

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

    const userDetailsResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/insta_details`,
      {
        accessToken: longLivedAccessToken,
      }
    );

    const { user_id, username } = userDetailsResponse.data;

    console.log("access token:", longLivedAccessToken);
    let user;
    if (isInstagramLogin) {
      user = await UserModel.findOne({
        instagramId: user_id,

        provider: "instagram",
      });

      if (user) {
        user = await UserModel.findByIdAndUpdate(
          user._id,
          {
            instagramAccessToken: longLivedAccessToken,
            instagramUsername: username,
          },
          { new: true }
        );
      } else {
        user = await UserModel.create({
          provider: "instagram",
          instagramAccessToken: longLivedAccessToken,
          instagramId: user_id,
          instagramUsername: username,
        });
      }
    } else {
      user = await UserModel.findByIdAndUpdate(
        userId,
        {
          instagramAccessToken: longLivedAccessToken,
          instagramId: user_id,
          instagramUsername: username,
        },
        {
          new: true,
          select:
            "_id name email provider instagramId instagramUsername instagramAccessToken ",
        }
      );

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Create response with user data
    const response = NextResponse.json({
      user,
      tokenData: longLivedTokenResponse.data,
    });

    // Set cookie with user details that expires in 30 days
    response.cookies.set({
      name: "user_details",
      value: JSON.stringify({
        _id: user._id,
        provider: "instagram",
        instagramUsername: username,
        instagramId: user_id,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
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
