import { NextResponse } from "next/server";
import axios from "axios";
import UserModel, { IUser } from "@/models/User";
import dbConnect from "@/lib/dbConnect";

interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { code } = await req.json();
    console.log("[Instagram Token] Received authorization code:", code);

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    try {
      const payload = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`,
        code,
      });

      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || !process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET) {
        console.error("[Instagram Token] Missing required environment variables");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      console.log(
        "[Instagram Token] Requesting short-lived token with payload:",
        {
          client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID,
          redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`,
          code,
        }
      );

      try {
        const tokenResponse = await axios.post<InstagramTokenResponse>(
          "https://api.instagram.com/oauth/access_token",
          payload,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const shortLivedAccessToken = tokenResponse.data.access_token;
        console.log("[Instagram Token] Received short-lived token");

        // Exchange for long-lived token
        console.log("[Instagram Token] Exchanging for long-lived token...");
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
        const longLivedAccessToken = longLivedTokenResponse.data.access_token;
        console.log("[Instagram Token] Received long-lived token");

        // Get user details
        console.log("[Instagram Token] Fetching user details...");
        const userDetailsResponse = await axios.get(
          `https://graph.instagram.com/me`,
          {
            params: {
              fields: "id,username",
              access_token: longLivedAccessToken,
            },
          }
        );

        const { id, username } = userDetailsResponse.data;
        const user_id = id; // Map id to user_id
        console.log("[Instagram Token] User details received:", {
          user_id,
          username,
        });

        let user = await UserModel.findOne({
          instagramId: user_id,
        });
        console.log("[Instagram Token] Existing user found:", !!user);

        if (user) {
          console.log("[Instagram Token] Updating existing user...");
          user = await UserModel.findByIdAndUpdate(
            user._id,
            {
              instagramId: user_id,
              instagramAccessToken: longLivedAccessToken,
              instagramUsername: username,
            },
            { new: true }
          );
          console.log("[Instagram Token] User updated successfully");
        } else {
          console.log("[Instagram Token] Creating new user:", username);
          user = await UserModel.create({
            instagramAccessToken: longLivedAccessToken,
            instagramId: user_id,
            instagramUsername: username,
          });
          console.log(
            "[Instagram Token] New user created successfully:",
            user._id.toString()
          );
        }

        const userData: Partial<IUser> & { _id: string } = {
          _id: user._id.toString(),
          instagramUsername: username,
          instagramId: user_id,
          instagramAccessToken: longLivedAccessToken,
          automations: user.automations || [],
        };

        const response = NextResponse.json({
          user: userData,
          tokenData: {
            access_token: longLivedAccessToken,
            user_id,
          },
        });

        response.cookies.set({
          name: "user_details",
          value: JSON.stringify(userData),
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });

        return response;
      } catch (error) {
        console.error(
          "[Instagram Token] Error details:",
          {
            message: error.response?.data?.error_message || error.message,
            status: error.response?.status,
            data: error.response?.data,
            code: error.code,
          }
        );
        
        // Check if it's an authorization code reuse
        if (error.response?.status === 400 && error.response?.data?.error_message?.includes("authorization code")) {
          return NextResponse.json(
            { error: "Authorization code has already been used" },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            error: error.response?.data?.error_message || error.message || "Authentication failed",
            details: error.response?.data
          },
          { status: error.response?.status || 400 }
        );
      }
    } catch (error) {
      console.error(
        "Instagram token exchange error:",
        error.response?.data || error.message || error
      );
      return NextResponse.json(
        {
          error:
            error.response?.data?.error_message ||
            error.message ||
            "Authentication failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(
      "Instagram token exchange error:",
      error.response?.data || error.message || error
    );
    return NextResponse.json(
      {
        error:
          error.response?.data?.error_message ||
          error.message ||
          "Authentication failed",
      },
      { status: 400 }
    );
  }
}
