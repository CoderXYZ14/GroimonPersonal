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

    const existingUserWithCode = await UserModel.findOne({
      lastAuthCode: code,
    });

    if (existingUserWithCode) {
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
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

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

    let user = await UserModel.findOne({
      instagramId: user_id,
    });
    console.log(user);
    if (!user) {
      user = await UserModel.create({
        instagramAccessToken: longLivedAccessToken,
        instagramId: user_id,
        instagramUsername: username,

        lastAuthCode: code,
      });
    } else {
      user.instagramAccessToken = longLivedAccessToken;
      user.lastAuthCode = code;
      await user.save();
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
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error(
      "Instagram token exchange error:",
      error.response?.data || error
    );
    return NextResponse.json(
      { error: error.response?.data?.error_message || error.message },
      { status: 400 }
    );
  }
}
