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

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Try to find a user with this auth code first
    const existingUserWithCode = await UserModel.findOne({
      lastAuthCode: code,
    });

    // If we found a user with this code, they're already authenticated
    if (existingUserWithCode) {
      console.log(
        "User found with existing auth code:",
        existingUserWithCode.instagramUsername
      );
      const userData = {
        _id: existingUserWithCode._id.toString(),
        instagramUsername: existingUserWithCode.instagramUsername,
        instagramId: existingUserWithCode.instagramId,
        instagramAccessToken: existingUserWithCode.instagramAccessToken,
        automations: existingUserWithCode.automations || [],
      };

      const response = NextResponse.json({
        user: userData,
        tokenData: {
          access_token: existingUserWithCode.instagramAccessToken,
          user_id: existingUserWithCode.instagramId,
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
    }

    try {
      // Try to exchange the code for a token
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

      const shortLivedAccessToken = tokenResponse.data.access_token;

      // Exchange for long-lived token
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

      // Get user details
      const userDetailsResponse = await axios.get(
        `https://graph.instagram.com/me`,
        {
          params: {
            fields: "id,username",
            access_token: longLivedAccessToken,
          },
        }
      );

      const { id: user_id, username } = userDetailsResponse.data;

      // First try to find a user with this Instagram ID
      let user = await UserModel.findOne({
        instagramId: user_id,
      });

      if (user) {
        // Update existing user
        console.log("Updating existing user:", username);
        user.instagramAccessToken = longLivedAccessToken;
        user.lastAuthCode = code;
        user.instagramUsername = username; // Update username in case it changed
        await user.save();
      } else {
        // Create new user
        console.log("Creating new user:", username);
        user = await UserModel.create({
          instagramAccessToken: longLivedAccessToken,
          instagramId: user_id,
          instagramUsername: username,
          lastAuthCode: code,
        });
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
      // Handle code reuse error specifically
      if (
        error.response?.data?.error_type === "OAuthException" &&
        error.response?.data?.error_message?.includes(
          "authorization code has been used"
        )
      ) {
        console.log("Auth code already used, trying to recover user session");

        // This is a special case - the code has been used but we don't have it in our database
        // Try to extract Instagram ID from cookies or session if possible
        const cookieHeader = req.headers.get("cookie");
        let instagramIdFromCookie = null;

        if (cookieHeader) {
          const userDetailsCookie = cookieHeader
            .split(";")
            .find((c) => c.trim().startsWith("user_details="));

          if (userDetailsCookie) {
            try {
              const userDetails = JSON.parse(
                decodeURIComponent(userDetailsCookie.split("=")[1])
              );
              if (userDetails.instagramId) {
                instagramIdFromCookie = userDetails.instagramId;
              }
            } catch (e) {
              console.error("Failed to parse user details cookie:", e);
            }
          }
        }

        let user = null;

        // Try to find user by Instagram ID from cookie
        if (instagramIdFromCookie) {
          console.log(
            "Looking up user by Instagram ID from cookie:",
            instagramIdFromCookie
          );
          user = await UserModel.findOne({
            instagramId: instagramIdFromCookie,
          });
        }

        // If we can't find the user by Instagram ID, we might need more recovery options
        if (!user) {
          return NextResponse.json(
            { error: "Session expired. Please log in again." },
            { status: 401 }
          );
        }

        console.log("Found existing user:", user.instagramUsername);

        // Update lastAuthCode to prevent this issue in the future
        user.lastAuthCode = code;
        await user.save();

        const userData = {
          _id: user._id.toString(),
          instagramUsername: user.instagramUsername,
          instagramId: user.instagramId,
          instagramAccessToken: user.instagramAccessToken,
          automations: user.automations || [],
        };

        const response = NextResponse.json({
          user: userData,
          tokenData: {
            access_token: user.instagramAccessToken,
            user_id: user.instagramId,
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
      }

      // Rethrow other errors
      throw error;
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
